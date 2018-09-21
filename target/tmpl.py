#!/usr/bin/env python
# -*- coding: utf-8 -*-
import paho.mqtt.client as mqtt_paho
import paho.mqtt.publish as publish_paho
from flask import Flask
import os
import re
import sys
import traceback
from target_config import MQTT_BROKER

sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 0)
mqttc = mqtt_paho.Client()
flaskapp = Flask(__name__)

@flaskapp.route('/favicon.ico')
def handle_fav():
    return '',204

def mqtt_sub(topic_filter):
    def reg_cb(func):
        def func_with_catch(*args, **kwargs):
            try:
                func(*args, **kwargs)
            except Exception as e:
                traceback.print_exc()
        mqttc.message_callback_add(topic_filter, func_with_catch)
    return reg_cb

# ------ Blockly Code BEGIN ------

"""_relpaced_with_blocks_"""

# ------ Blockly Code END ------

mqttc.connect(MQTT_BROKER, 1883, 60)
mqttc.subscribe("/#", 0)
mqttc.loop_start()

from gevent.wsgi import WSGIServer
http_server_ = WSGIServer(('', 8080), flaskapp, log=None)
print("Program running...")
http_server_.serve_forever()
