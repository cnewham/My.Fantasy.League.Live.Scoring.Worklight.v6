/**
 * MyFantasyLeagueViewModel for Knockout.JS
 */

var refreshInterval = 1000 * 30; //30 seconds default

var player = function(id, name, position, team, points, remaining) {
	var self = this;

	self.id = id;
	self.name = name;
	self.position = position;
	self.team = team;

	self.points = ko.observable(points);
	self.remaining = ko.observable(remaining);

	self.status = ko.computed(function() {
		
		if (self.remaining() == 3600) //yet to play
			return 0;
		if (self.remaining() > 0 && self.remaining() < 3600) //Currently playing
			return 1;

		return 2; //Finished playing
	});

	self.displayName = ko.computed(function() {
		return self.name + " " + self.team + " " + self.position;
	});

};

var franchise = function(id, name, players) {
	var self = this;

	self.id = id;
	self.name = name;
	self.players = ko.observableArray(players);

	self.total = ko.computed(function() {
		var total = 0;
		ko.utils.arrayForEach(self.players(), function(player)
		{
			total += parseFloat(player.points());
		});

		return total.toFixed(2);
	});

	self.remaining = ko.computed(function() {
		var remaining = 0;
		ko.utils.arrayForEach(self.players(), function(player)
		{
			remaining += parseFloat(player.remaining());
		});

		return (remaining / 60).toFixed(0);
	});

};

var matchup = function(franchises) {
	var self = this;

	self.franchises = ko.observableArray(franchises);;

	self.winningId = ko.computed(function() {
		var max = 0;
		var id = 0;

		ko.utils.arrayForEach(self.franchises(), function(franchise)
		{
			var item = parseInt(franchise.total());

			if (item > max);
			{
				id = franchise.id;
				max = item;
			}
		});

		return id;
	});
};


var MyFantasyLeagueViewModel = function(matchups, refreshInterval) {
	
	this.refreshInterval = refreshInterval;
	this.matchups = ko.observableArray(matchups);

	ko.bindingHandlers.highlightScore = {
	    update: function(element, valueAccessor) {
	    	var val = ko.utils.unwrapObservable(valueAccessor());
	    	var orig = getPointsFromRowElement(element);
	    	
	    	if (orig)
	    		{
	    			if (orig > val)
	    				$(element).removeClass(scoreClassNeg).addClass(scoreClassNeg).removeClass(scoreClassNeg, refreshInterval);
	    			else
	    				$(element).removeClass(scoreClass).addClass(scoreClass).removeClass(scoreClass, refreshInterval);
	    		}
	    	else
	    		{
	    			$(element).removeClass(scoreClass).addClass(scoreClass).removeClass(scoreClass, refreshInterval);	
	    		}
	    }
	};

};
	
function getPointsFromRowElement(element)
{
	if (!element)
		return;
	
	if (element.children && element.children.length > 1)
		{
			var pointElement = element.children[1];
			
			if (pointElement && isNumber($(pointElement).text()))
				return parseFloat(origVal = $(pointElement).text());
			
			return;
		}

	return;
};

function isNumber(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
}