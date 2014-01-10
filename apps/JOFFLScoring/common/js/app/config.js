/**
 * JOFFL Configuration
 */
var config = {};
config.initialized = false;

var configDocId = 1;
var configDocName = 'joffl';


var configDoc = {
		mflid: '30211', 
		week: '',
		refreshInterval : 60 * 1000 //60 seconds 
};

config.id = function (){
	   
    this.set = function(val){
        configDoc.mflid = val;
    };
    
    return configDoc.mflid;
};

config.week = function (){
	   
    this.set = function(val){
        configDoc.week = val;
    };
    
    return configDoc.week;
};

config.refreshInterval = function (){
	   
    this.set = function(val){
        configDoc.refreshInterval = val;
    };
    
    return configDoc.refreshInterval;
};


config.init = function(onSuccess, onError){
	output.write("config :: init");
	
	if (config.initialized)
	{
		output.write("config :: init :: Already initialized");
		return;
	}
	
	//Object that defines all the collections
	var collections = {};
	
	//Object that defines the 'people' collection
	collections[configDocName] = {};

	
	$('#config button').click(function(e) {
		var element = $(e.currentTarget);
		var key = element.data("key");
		var name = element.find(".config-name").text();
		var value = element.find(".config-value").text();
		
		$( "#config-popup-key").val(key);
		$( "#config-popup-name").text(name);
		$( "#config-popup-value").val(value);
		$( "#config-popup" ).popup( "open" );
		
		$( "#config-popup-value").focus();
	});
	
	$('#config-save').click(function(e) {
		var key = $("#config-popup-key").val();
		var value = $("#config-popup-value").val();
		
		configDoc[key] = value;
		
		config.update(function(){
			updateConfigPage();
		}, null);
	});
	
	WL.JSONStore.init(collections)
		.then(function () {
			output.write("main :: init :: jsonStore init success");
			
			WL.JSONStore.get(configDocName).findById(configDocId)
			.then(function (result) {
				output.write("config :: jsonStore configuration retrieved");
				
				if (result.length > 0)
					configDoc = result[0].json;
				else
					WL.JSONStore.get(configDocName).add(configDoc);
				
				updateConfigPage();	
				onSuccess();
			})
			.fail(function (errorObject) {
				output.write("config :: init :: jsonStore findById error: " + errorObject.msg);
				
				onError(errorObject.msg);
			});
		})
		.fail(function (errorObject) {
			output.write("config :: init :: jsonStore error: " + errorObject.msg);
			
			onError(errorObject.msg);
		});
	
	config.initialized = true;	
};


/**
 * Updates the configuration elements on the page
 */
function updateConfigPage(){
	$('#config button').each(function(index) {
		var key = $(this).data("key");
		$(this).find(".config-value").text(configDoc[key]);
	});
}

config.update = function(onSuccess, onError){
	var options = {}; //default
	WL.JSONStore.get(configDocName)
		.replace({_id: configDocId, json: configDoc}, options)
		.then(function () {
			output.write("config :: jsonStore configuration updated");
			onSuccess();
		})
		.fail(function (errorObject) {
			output.write("config :: update :: jsonStore error: " + errorObject.msg);
			onError(errorObject.msg);
	});
};

config.close = function(){
	WL.JSONStore.closeAll()
	.then(function () {
		output.write("config :: jsonStore configuration closed");
	})
	.fail(function (errorObject) {
		output.write("config :: close :: jsonStore error: " + errorObject.msg);
	});
};