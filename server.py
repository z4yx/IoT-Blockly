#!/usr/bin/env python
from flask import Flask,request,send_from_directory
import socketio
import eventlet
import eventlet.wsgi
import threading
import os
import subprocess
from datetime import datetime
import Queue

TARGET_FILE_PATH = 'target/.gen_full.py'
SAVED_BLOCKLY_XML = 'target/.blocks.xml'

with open('target/tmpl.py','r') as f:
    target_template = f.read()
sio = socketio.Server()
flaskapp = Flask(__name__, static_url_path='')
daemon_proc = None
daemon_output_cv = threading.Condition()
stdout_queue = Queue.Queue()
# daemon_output_thread_started = threading.Semaphore(0)

def daemon_output_thread():
    daemon_output_cv.acquire()
    # daemon_output_thread_started.release();
    while True:
        try:
            for line in iter(daemon_proc.stdout.readline, b''):
                now = datetime.now().replace(microsecond=0)
                line = "[{}] {}".format(now, line)
                print(line),
                # sio.emit('stdout', line)
                stdout_queue.put(line)
            print("Daemon exited")
        except Exception as e:
            print(e)
        print("Waiting for daemon...")
        daemon_output_cv.wait()
    daemon_output_cv.release()

def daemon_output_sio_task():
    while True:
        try:
            line = stdout_queue.get_nowait()
            sio.emit('stdout', line)
        except Queue.Empty as e:
            sio.sleep(0.5)

def start_daemon():
    def do_start_daemon():
        global daemon_proc
        daemon_output_cv.acquire()
        try:
            print("Starting daemon")
            daemon_proc = subprocess.Popen(TARGET_FILE_PATH,
                            # shell=True,
                            bufsize=1, # means line buffered
                            universal_newlines=True,
                            # stdin=subprocess.PIPE,
                            stderr=subprocess.STDOUT,
                            stdout=subprocess.PIPE)
            daemon_output_cv.notify()
            print("Daemon started")
        except Exception as e:
            print(e)
        daemon_output_cv.release()
    # t1 = Thread(target=do_start_daemon)
    # t1.setDaemon(False)
    # t1.start()
    do_start_daemon()

def restart_daemon():
    try:
        daemon_proc.terminate()
    except Exception as e:
        print(e)
    start_daemon()

@flaskapp.route('/api/apply',methods=["POST"])
def api_apply():
    try:
        gen_code = request.data
        with open(TARGET_FILE_PATH,'w') as f: 
            f.write(gen_code)
        os.chmod(TARGET_FILE_PATH, 0774)

        restart_daemon()
        return ''
    except Exception as e:
        print(e)
        raise e

@flaskapp.route('/')
def handle_root():
    return send_from_directory('static', 'index.html')

@flaskapp.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@flaskapp.route('/api/template')
def send_tmpl():
    return target_template

@flaskapp.route('/api/saved',methods=['POST', 'GET'])
def api_saved():
    if request.method == 'GET':
        return send_from_directory('.', SAVED_BLOCKLY_XML)
    with open(SAVED_BLOCKLY_XML, 'w') as f:
        f.write(request.data)
    return ''

if __name__ == '__main__':

    sio.start_background_task(daemon_output_sio_task)
    threading.Thread(target=daemon_output_thread).start()
    start_daemon();

    from gevent.wsgi import WSGIServer
    app = socketio.Middleware(sio, flaskapp)
    eventlet.wsgi.server(eventlet.listen(('', 8000)), app)
