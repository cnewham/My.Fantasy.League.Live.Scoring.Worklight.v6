
var busyIndicator = null;
var jsonStore;

var output = {
		write : function(message) { 
			var write = $('#write');
	
			var out = new Date().toLocaleTimeString() + " : " + message;
	
			WL.Logger.info(message);
			write.prepend("<li>" + out + "</li>");
		},
		error : function(message) {
			var write = $('#write');
			
			var out = new Date().toLocaleTimeString() + " : " + message;
	
			WL.Logger.error(message);
			write.prepend("<li class='error'>ERROR: " + out + "</li>");
		},
		clear : function() {
			$('#write li').remove();
		}
};

var displayMessage = function(message){
	//display error message here
};

function wlCommonInit(){

	busyIndicator = new WL.BusyIndicator('AppBody');
	
	$('#refresh').click(function(){
		scores.refresh();
	});
	
	config.init(function(){
		scores.init(null, displayMessage);	
	},displayMessage);	
	
};




