function randomInt(i) {
    //returns an int from 0 to i (inclusive). Weighted so that previously-unchosen numbers
    //are more likely.
    if(! this.number_counts) this.number_counts = [];
    if (i!=this.number_counts.length) {
	this.number_counts=Array.apply(null, new Array(i)).map(Number.prototype.valueOf,0);
    }
    number_counts_copy = this.number_counts.slice(0);//clone array
    var result = Math.floor(Math.random()*i);
    var accept = false;
    while(!accept) {
	var count = number_counts_copy[result];
	var min = Math.min.apply(null,number_counts_copy);
	if(count<=min) {
	    this.number_counts[result]++;
	    accept = true;
	} else {
	    number_counts_copy[result]-=.7;
	    result = Math.floor(Math.random()*i);
	}
    }
    return result
}

var TDChords = {"maj": [0, 4, 7],
		 "min": [0, 3, 7],
		 "aug": [0, 4, 8],
		 "dim": [0, 3, 6],
		 "dom7": [0, 4, 7, 10],
		 "maj7": [0, 4, 7, 11],
		 "min7": [0, 3, 7, 10],
		 "sus2": [0, 2, 7],
		 "sus4": [0, 5, 7],
		 "dim7": [0, 3, 6, 9],
		 "halfdim7": [0, 3, 6, 10],
		 "minmaj7": [0, 3, 7, 11],
		 "aug7": [0, 4, 8, 10],
		 "augmaj7": [0, 4, 8, 11],
		};

TDChordDescriptions = {
    "maj": "1, 3, 5",
    "min": "1, ♭3, 5",
    "aug": "1, 3, ♯5",
    "dim": "1, ♭3, ♭5",
    "dom7": "1, 3, 5, ♭7",
    "maj7": "1, 3, 5, 7",
    "min7": "1, ♭3, 5, ♭7",
    "sus2": "1, 2, 5",
    "sus4": "1, 4, 5",
    "dim7": "1, ♭3, ♭5, ♭♭7",
    "halfdim7": "1, ♭3, ♭5, ♭7",
    "minmaj7": "1, ♭3, 5, 7",
    "aug7": "1, 3, ♯5, ♭7",
    "augmaj7": "1, 3, ♯5, 7",
}

TDChordNames = {
    "maj": "Major",
    "min": "Minor",
    "aug": "Augmented",
    "dim": "Diminished",
    "dom7": "Dominant Seventh",
    "maj7": "Major Seventh",
    "min7": "Minor Seventh",
    "sus2": "Suspended Second",
    "sus4": "Suspended Fourth",
    "dim7": "Diminished Seventh",
    "halfdim7": "Half Diminished Seventh",
    "minmaj7": "Minor Major Seventh",
    "aug7": "Augmented Seventh",
    "augmaj7": "Augmented Major Seventh",
}

function updateScore(is_correct) {
    $('#total-reps').html(Number($('#total-reps').html())+1);
    if(is_correct) {
	$('#correct-reps').html(Number($('#correct-reps').html())+1);
    }
}

function endQuiz() {
    MIDI.stopAllNotes();
    $(document).unbind('keydown');
    $("#quiz-row").hide();
    $("#finished-row").show();
    $('#hear-next').show();
    $("#finished-correct-reps").html($("#correct-reps").html());
    $("#finished-total-reps").html($("#total-reps").html());
    var percent = Number($("#correct-reps").html())/Number($("#total-reps").html());
    $("#finished-percentage").html((percent*100).toFixed(2));
    if(Number($("#total-reps").html())>0) {
	$("#post-quiz-info").show();
    } else {
	$("#post-quiz-info").hide();
    }
}

function chordI(root_note) {
    return [root_note, root_note+4, root_note+7];
}
function chordIV(root_note) {
    return [root_note+5, root_note+9, root_note+12];
}
function chordV(root_note) {
    return [root_note+7, root_note+11, root_note+14];
}

