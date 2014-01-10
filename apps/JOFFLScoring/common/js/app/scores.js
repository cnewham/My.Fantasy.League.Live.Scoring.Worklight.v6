/**
 * JOFFL Live Scoring
 */

var scores = {};
scores.initialized = false;

var scoreClass;
var scoreClassNeg;

var leagueData;
var activePlayers;

var update = {
	intervalId : null,
	interval : config.refreshInterval(),
	
	start : function(execute){
		if (execute)
			processUpdates();
		
		this.intervalId = setInterval(processUpdates, this.interval);	
	},
	stop : function(){
		if (this.intervalId)
			clearInterval(this.intervalId);
	},
	exec : function(){
		this.stop;
		this.start(true);
	}
};

var lastUpdate = {
		refresh : function(){
			var update = new Date().toLocaleTimeString();
			$('#lastupdate').html("<b>" + update + "</b>");
		}
};

scores.refresh = function(){
	update.exec();
};

scores.init = function(onSuccess, onError){
	output.write("Live Scores :: init");
	
	if (scores.initialized)
	{
		output.write("Live Scores :: Already initialized");
		return;
	}
	
	//Recycle button handler
	$('#lastupdate').click(function(){
		update.exec();
	});	
		
	//Initialize data
	
	activePlayers = [];
	output.write("Connecting to MyFantasyLeague.com...");

	$('#matchups').hide();
	busyIndicator.show();
	
	//First load cached league data
	$.getJSON('js/app/league.json', function(league) {
		leagueData = league;

		var invocationData = {
				adapter : 'LiveScoring',
				procedure : 'getLiveScores',
				parameters : [config.id(), config.week()]
			};
		
		WL.Client.invokeProcedure(invocationData,{
			onSuccess : function (result) {
							var payload = result.invocationResult;
							
				        	output.write("Updating matchups");
				        	var matchups = [];
				        	
				        	if (!payload.liveScoring)
				        		onError("MyFantasyLeague did not return any data. Please check League ID");
			
				    		$.each(payload.liveScoring.matchup, function(index, value) {
								var franchises = [];
			
								$.each(value.franchise, function(index, value) {
									var players = [];
			
									if (value.players.player)
									{
										$.each(value.players.player, function(index, value) {
											
											if (value.status == "starter")
											{
												var newPlayer = buildPlayer(value.id, value.score, value.gameSecondsRemaining);
			
												activePlayers.push(newPlayer);
												players.push(newPlayer);
											}
										});
									}
									
									franchises.push(buildFranchise(value.id, players));
								});
				    			
				    			matchups.push(new matchup(franchises));
						    });
			
				    		//Apply knockout bindings
							ko.applyBindings(new MyFantasyLeagueViewModel(matchups, update.interval));
							
							$('#matchups').show();
							busyIndicator.hide();
							
							lastUpdate.refresh();
							
							//HACK: define the actual class name so knockout update doesn't execute class transition the first time data is loaded
							scoreClass = "score";
							scoreClassNeg = "score-neg";
							
							//Start auto updates
							update.start(false);
							scores.initialized = true;
							onSuccess();
	        },
			onFailure : function (result) {
				busyIndicator.hide();
				
				WL.SimpleDialog.show("LiveScoreUpdate", "Cannot connect to MyFantasyLeague. Please check your internet connectivity.", 
						[{
							text : 'Reload App',
							handler : WL.Client.reloadApp 
						}]);
				
				lastUpdate.refresh();
				
				if (result)
					output.error(toString(result.errors));
				else
					output.error("Error connecting to MyFantasyLeague api");
				
				onError(tostring(result.errors));
			}
		});
	});
};

/**
 * Processes periodic updates
 */
function processUpdates() {
	var invocationData = {
			adapter : 'LiveScoring',
			procedure : 'getLiveScores',
			parameters : [config.id(), config.week()]
		};
	
	WL.Client.invokeProcedure(invocationData,{
		onSuccess: function (result) {
        	output.write("Updating scores");
        	
        	var payload = result.invocationResult;

    		$.each(payload.liveScoring.matchup, function(index, value) {
				$.each(value.franchise, function(index, value) {
					$.each(value.players.player, function(index, value) {
					
						var player = getActivePlayer(value.id);

						if (player != null)
						{		
							player.remaining(value.gameSecondsRemaining);
							player.points(value.score);
						}	
			
					});
				});
		    });

    		//TESTING
    		// output.write("processUpdate() executed");

//    		var player = activePlayers[Math.floor((Math.random()*activePlayers.length)+1)];
    		var player = activePlayers[1];
    		var player2 = activePlayers[2];

    		player.points(player.points() - 1);    
    		player2.points(player.points() + 2);    
    		
    		lastUpdate.refresh();
        }
    });


};

/**
 * Gets player reference from the active player list
 * @param {int} id
 * @returns {player}
 */
function getActivePlayer(id) {

	for (var i = 0; i < activePlayers.length; i++)
	{
		if (activePlayers[i].id == id)
		{
			return activePlayers[i];
		};
	}

	return null;
};

/**
 * Builds franchise object
 * @param {int} id
 * @param {player[]} players
 * @returns {franchise}
 */
function buildFranchise(id, players) {
	for (var i = 0; i < leagueData.franchises.length; i++)
	{
		if (leagueData.franchises[i].id == id)
			return new franchise(id, leagueData.franchises[i].name, players);
	}

	return new franchise(id, "N/A", players);
};

/**
 * Builds player object
 * @param {int} id
 * @param {number} points
 * @param {number} remaining
 * @returns {player}
 */
function buildPlayer(id, points, remaining) {
	for (var i = 0; i < leagueData.players.player.length; i++)
	{
		if (leagueData.players.player[i].id == id)
		{
			var match = leagueData.players.player[i];
			return new player(id, match.name, match.position, match.team, points, remaining);
		};
	}

	return new player(id, "N/A", "N/A", "N/A");
};