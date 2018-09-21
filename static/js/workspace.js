
Blockly.Blocks['onsensorvalueupdate'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("收到来自节点")
        .appendField(new Blockly.FieldTextInput("n_123456"), "node_name");
    this.appendDummyInput()
        .appendField("的传感器")
        .appendField(new Blockly.FieldTextInput("temperature"), "input_name")
        .appendField("上报的数据后");
    this.appendStatementInput("callback")
        .setCheck(null)
        .appendField("放入变量")
        .appendField(new Blockly.FieldVariable("value"), "value")
        .appendField("并运行");
    this.setInputsInline(true);
    this.setColour(290);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['sendactuatorcommand'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("向节点")
        .appendField(new Blockly.FieldTextInput("n_123456"), "node_name")
        .appendField("上的");
    this.appendValueInput("cmd")
        .setCheck(null)
        .appendField("执行器")
        .appendField(new Blockly.FieldTextInput("switch"), "actuator_name")
        .appendField("发送指令");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(20);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['onhttprequest'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("HTTP客户端访问“http://"+location.hostname+":8080/参数1/参数2/参数3/...”时");
    this.appendStatementInput("callback")
        .setCheck(null)
        .appendField("参数放入列表")
        .appendField(new Blockly.FieldVariable("args"), "args")
        .appendField("并运行");
    this.appendValueInput("resp")
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("返回结果");
    this.setColour(290);
 this.setTooltip("参数可以有0到任意多个");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['extract_number'] = {
  init: function() {
    this.appendValueInput("input_val")
        .setCheck("String")
        .appendField("提取数值");
    this.setOutput(true, "Number");
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
// Blockly.Blocks['onsensorvalueupdate'] = {
//   init: function() {
//     this.jsonInit(onsensorvalueupdateJson);
//   }
// };

Blockly.Python['onsensorvalueupdate'] = function(block) {
  var text_node_name = block.getFieldValue('node_name');
  var text_input_name = block.getFieldValue('input_name');
  var variable_value = Blockly.Python.variableDB_.getName(block.getFieldValue('value'), Blockly.Variables.NAME_TYPE);
  var statements_callback = Blockly.Python.statementToCode(block, 'callback');

  var globals = [];
  var varName;
  var workspace = block.workspace;
  var variables = workspace.getAllVariables() || [];
  for (var i = 0, variable; variable = variables[i]; i++) {
    varName = variable.name;
    globals.push(Blockly.Python.variableDB_.getName(varName,
        Blockly.Variables.NAME_TYPE));
  }
  globals = globals.length ? Blockly.Python.INDENT + 'global ' + globals.join(', ') + '\n' : '';

  var func_name = 'cb_'+Math.random().toString(36).substring(7);
  var code = "@mqtt_sub('/values/'+" + 
  				Blockly.Python.quote_(text_node_name) +
  				"+'/'+" +
  				Blockly.Python.quote_(text_input_name) +
  				")\n";
  code += "def "+func_name+"(client__, userdata__, mqtt_msg_):\n";
  code += globals;
  code += Blockly.Python.INDENT+variable_value+" = mqtt_msg_.payload\n";
  code += statements_callback /*|| Blockly.Python.PASS*/;
  return code;
};

Blockly.Python['sendactuatorcommand'] = function(block) {
  var text_node_name = block.getFieldValue('node_name');
  var text_actuator_name = block.getFieldValue('actuator_name');
  var value_name = Blockly.Python.valueToCode(block, 'cmd', Blockly.Python.ORDER_COMMA);

  var code = "publish_paho.single('/control/'+" +
  				Blockly.Python.quote_(text_node_name) +
  				"+'/'+" +
  				Blockly.Python.quote_(text_actuator_name) +
  				", str(" +
  				(value_name || "''") +
  				"), hostname=MQTT_BROKER)\n";
  return code;
};

Blockly.Python['onhttprequest'] = function(block) {
  var variable_args = Blockly.Python.variableDB_.getName(block.getFieldValue('args'), Blockly.Variables.NAME_TYPE);
  var statements_callback = Blockly.Python.statementToCode(block, 'callback');
  var value_resp = Blockly.Python.valueToCode(block, 'resp', Blockly.Python.ORDER_ATOMIC);

  var globals = [];
  var varName;
  var workspace = block.workspace;
  var variables = workspace.getAllVariables() || [];
  for (var i = 0, variable; variable = variables[i]; i++) {
    varName = variable.name;
    globals.push(Blockly.Python.variableDB_.getName(varName,
        Blockly.Variables.NAME_TYPE));
  }
  globals = globals.length ? Blockly.Python.INDENT + 'global ' + globals.join(', ') + '\n' : '';

  var code = "@flaskapp.route('/<path:request_path_>')\n";
  code += "def http_handle(request_path_):\n";
  code += globals;
  code += Blockly.Python.INDENT+variable_args+" = request_path_.split('/')\n";
  code += statements_callback /*|| Blockly.Python.PASS*/;
  code += Blockly.Python.INDENT+"_http_ret_ = "+(value_resp || '')+"\n";
  code += Blockly.Python.INDENT+"return '' if (_http_ret_ is None) else _http_ret_\n";
  return code;
};

Blockly.Python['extract_number'] = function(block) {
  var value_input_val = Blockly.Python.valueToCode(block, 'input_val', Blockly.Python.ORDER_COMMA);
  var code = "float(re.search(r'[-+]?\\d+(\\.\\d*)?', "+value_input_val+").group())";
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python.addReservedWords("Flask,flaskapp,mqttc,mqtt_sub,os,re,sys,traceback");

var toolbox = document.getElementById("toolbox");

var options = { 
  toolbox : toolbox, 
  collapse : true, 
  comments : true, 
  disable : true, 
  maxBlocks : Infinity, 
  trashcan : true, 
  horizontalLayout : false, 
  toolboxPosition : 'start', 
  css : true, 
  media : 'static/media/', 
  rtl : false, 
  scrollbars : true, 
  sounds : true, 
  oneBasedIndex : true, 
  grid : {
    spacing : 20, 
    length : 1, 
    colour : '#888', 
    snap : false
  }, 
  zoom : {
    controls : true, 
    wheel : true, 
    startScale : 1, 
    maxScale : 3, 
    minScale : 0.3, 
    scaleSpeed : 1.2
  }
};

// for (var messageKey in MSG) {
//  if (messageKey.indexOf('cat') == 0) {
//    Blockly.Msg[messageKey.toUpperCase()] = MSG[messageKey];
//  }
// }

var iot_blockly = new Vue({
  el: '#iot_blockly',
  data: {
    workspace: Blockly.inject('content_blocks', options),
    socket: io(),
    show_logs: false,
    logs: '',
    tab_index: 'blocks',
  },
  watch: {
    tab_index: function(newVal){
      if(newVal=='python'){
        document.getElementById('content_blocks').classList.add("hide");
        document.getElementById('content_python').innerHTML = this.htmlEntities(this.generateCode());
        document.getElementById('content_python').classList.remove("hide");
      }else{
        document.getElementById('content_blocks').classList.remove("hide");
        document.getElementById('content_python').classList.add("hide");
      }
    },
  },
  methods: {
    htmlEntities(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
    generateCode: function(){
      return Blockly.Python.workspaceToCode(this.workspace);
    },
    generateXml: function(){
      return Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(this.workspace));
    },
    importXml: function(xml){
      this.workspace.clear();
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), this.workspace);
    },
    callSaveApi: function(xml, success){
      this.$http.post('api/saved', xml).then(success, function(resp){
        console.log(resp);
      });
    },
    uploadBlocks: function(){
      document.getElementById('fileinput').click();
    },
    fileSelected: function(evt){
      var vueObj = this;
      var files = evt.target.files;
      console.log(files);
      if(files == 0)
        return;
      var reader = new FileReader();
      reader.onload = function(e) {
        try{
          // var parser = new DOMParser();
          // var xmlDoc = parser.parseFromString(e.target.result,"text/xml");
          vueObj.importXml(e.target.result);
        }catch(err){
          console.log(err);
        }
      };
      reader.readAsText(files[0]);
    },
    downloadBlocks: function(){
      var blob = new Blob([this.generateXml()], {type: "text/xml;charset=utf-8"});
      saveAs(blob, "blockly.xml");
    },
    saveToServer: function(){
      var xml = this.generateXml();
      this.callSaveApi(xml, function(resp){
        alert('暂存设计成功');
      });
    },
    applyBlocks: function(){
      var xml = this.generateXml();
      this.callSaveApi(xml, function(resp){
        var code = this.generateCode();
        this.$http.post('api/apply', code).then(function(resp){
          alert('已保存并运行');
        }, function(resp){
          console.log(resp);
        });
      });
    },
    toggleLogs: function(){
      this.show_logs = !this.show_logs;
    },
  },
  created: function(){
    var self = this;
    this.$http.get('api/saved').then(function(resp){
      var xml = resp.data;
      self.importXml(xml);
    }, function(resp){
      console.log(resp);
    });
    this.socket.on('stdout', function(log){
      self.logs += log;
    });
  }
});


/* Load Workspace Blocks from XML to workspace. Remove all code below if no blocks to load */

/* TODO: Change workspace blocks XML ID if necessary. Can export workspace blocks XML from Workspace Factory. */
// var workspaceBlocks = document.getElementById("workspaceBlocks"); 

/* Load blocks to workspace. */
// Blockly.Xml.domToWorkspace(workspace, workspaceBlocks);
