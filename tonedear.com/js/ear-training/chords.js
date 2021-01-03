window.onload = function () {
    td = new Exercise();

    td.chords = {
	"maj": [0, 4, 7],
	"min": [0, 3, 7],
	"aug": [0, 4, 8],
	"dim": [0, 3, 6],
	"dom7": [0, 4, 7, 10],
	"maj6": [0, 4, 7, 9],
	"min6": [0, 3, 7, 9],
	"maj7": [0, 4, 7, 11],
	"min7": [0, 3, 7, 10],
	"sus2": [0, 2, 7],
	"sus4": [0, 5, 7],
	"dim7": [0, 3, 6, 9],
	"dimmaj7": [0, 3, 6, 11],
	"halfdim7": [0, 3, 6, 10],
	"minmaj7": [0, 3, 7, 11],
	"aug7": [0, 4, 8, 10],
	"augmaj7": [0, 4, 8, 11],
    }

    td.chord_descriptions = {
	"maj": "1, 3, 5",
	"min": "1, ♭3, 5",
	"aug": "1, 3, ♯5",
	"dim": "1, ♭3, ♭5",
	"dom7": "1, 3, 5, ♭7",
	"maj6": "1, 3, 5, 6",
	"min6": "1, ♭3, 5, 6",
	"maj7": "1, 3, 5, 7",
	"min7": "1, ♭3, 5, ♭7",
	"sus2": "1, 2, 5",
	"sus4": "1, 4, 5",
	"dim7": "1, ♭3, ♭5, ♭♭7",
	"dimmaj7": "1, ♭3, ♭5, 7",
	"halfdim7": "1, ♭3, ♭5, ♭7",
	"minmaj7": "1, ♭3, 5, 7",
	"aug7": "1, 3, ♯5, ♭7",
	"augmaj7": "1, 3, ♯5, 7",
    }

    td.inversion = 0;
    td.inversion_identified = false;
    td.inversions = [];
    td.chord_identified = false;
;
    function constructChord(root, chord_array, inversion) {
	//chordArray should be in the format of semitones-from-root, e.g. [0, 4, 7] for a major triad
	for (var i = 0; i < chord_array.length; ++i) {
	    chord_array[i]+=root;
	    if(i<inversion) chord_array[i]+=12;
	}
	chord_array.sort();
	return chord_array;
    }

    var origSetOptions = td.setOptions;
    td.setOptions = function() {
	origSetOptions();
	$('.quickstart-inversion').each(function() {
	    var num = $(this).attr('num');
	    if(this.checked) {
		$('.inversion[num="'+num+'"]').attr('checked','checked');
	    } else {
		$('.inversion[num="'+num+'"]').removeAttr('checked');
	    }

	});
    }

    td.setupQuiz = function(el) {
	$('#hear-individual').show();
	$('#quiz-messages').empty();
	td.inversion_identified=false;
	td.chord_identified=false;

	//Choose root note
	if($('#fixed-root-toggle').hasClass('down')) {
	    td.root_note = 55+Math.floor(Math.random()*18);
	} else {
	    td.root_note = 62;
	}

	//Choose chord
	td.chord_name = $(el).attr('chord');
	td.answer = $(el).attr('chord');
	td.chord = td.chords[td.chord_name].slice(0);//clone array
	td.identified_inversion = -1;
	td.inversions = $(".inversion:checked");
	
	td.inversion = Number($(td.inversions[randomInt(td.inversions.length)]).attr('num'));
	if(td.chord.length<td.inversion+1) td.inversion=0; //If a 3rd inversion is chosen for a triad, just use root position
	td.chord = constructChord(td.root_note, td.chord, td.inversion);

    }

    td.hearQuiz = function() {
	MIDI.stopAllNotes();
	MIDI.chordOn(0, td.chord, 127, 0);
    }

    td.displayAnswerChoices = function() {
	var toggle_buttons = $(".interval-toggle").not('.down');
	$('#answer-choices').css({ visibility: "visible" });
	$('#chord-choices').empty();
	$('#chord-choices').show();
	for (var i = 0; i < toggle_buttons.length; ++i) {
	    var choice = $(toggle_buttons[i]).attr('answer');
	    var choice_name = $(toggle_buttons[i]).html();
	    var hotkey = $(toggle_buttons[i]).attr('hotkey');
	    $('#chord-choices').append('<a id="answer-btn-'+hotkey+'" class="btn btn-primary answer-btn" answer="'+choice+'" >'+choice_name+'</a> ');

	    if(td.enable_hotkeys) {
		$("#answer-btn-"+hotkey).append(" <sup>["+hotkey+"]</sup>");
	    }
	}
	$("#chord-choices").append("<br><span class='quiz-messages'></span><br>");

	$('#inversion-choices').empty();
	$('#inversion-choices').show();
	for (var i = 0; i < td.inversions.length; ++i) {
	    var choice = $(td.inversions[i]).attr('num');
	    var choice_name = $(td.inversions[i]).attr('name');
	    var hotkey = $(td.inversions[i]).attr('hotkey');
	    $('#inversion-choices').append('<a id="answer-btn-'+hotkey+'" class="btn btn-primary inversion-answer-btn" answer="'+choice+'" >'+choice_name+'</a> ');
	    if(td.enable_hotkeys) {
		$("#answer-btn-"+hotkey).append(" <sup>["+hotkey+"]</sup>");
	    }
	}
	if(td.inversions.length==1) {
	    td.inversion_identified = true;
	    $("#inversion-choices").hide();
	} else {
	    $("#chord-choices").prepend("<strong>Chord</strong><br>");
	    $("#inversion-choices").prepend("<strong>Inversion</strong><br>");
	    $("#inversion-choices").append("<br><span class='quiz-messages'></span><br>");
	    $(".inversion-answer-btn").fastClick(td.onInversionBtnClick);
	    td.inversions.each(function() {
		var hotkey = $(this).attr('hotkey');
		$(document).bind('keydown.answers', hotkey, function() {$("#answer-btn-"+hotkey).click(); });
	    });
	}
    }
    
    // normalize chord to zero-based intervals
    td.normalizeChord = function(chord) {
        var chord = chord.slice(0).sort(function(a, b) { return a - b });
        return chord.map(function(x) { return x - chord[0] })
    }
    
    // return compatible inversions for selected chord name
    td.getChordInversions = function(chord_name) {
        var correct_inversions = [];
        var normalized_chord = td.normalizeChord(td.chord);
        for (var inversion = 0; inversion < td.chords[chord_name].length; inversion++) {
            if(td.inversions.filter("[num='"+inversion+"']").length==0) continue;
            var chord = td.chords[chord_name].slice(0);
            chord = constructChord(0, chord, inversion);
            //console.log(normalized_chord, td.normalizeChord(chord));
            //console.log(normalized_chord.toString(), td.normalizeChord(chord).toString());
            //console.log(normalized_chord.toString()==td.normalizeChord(chord).toString());
            if (normalized_chord.toString() == td.normalizeChord(chord).toString()) {
                correct_inversions.push(inversion);
            }
        }
        return correct_inversions;
    }
    // return compatible chord names for selected inversion
    td.getInversionChords = function(inversion) {
        var compatible_chords = []
        for (chord_name in td.chords) {
            if($(".answer-btn[answer='"+chord_name+"']").length==0) continue;
            var inversions = td.getChordInversions(chord_name);
            if (inversions.indexOf(inversion) > -1) {
                compatible_chords.push(chord_name);
            }
        }
        return compatible_chords;
    }
    td.checkChordAnswer = function(chord_name) {
        var correct_inversions = td.getChordInversions(chord_name);
        if (correct_inversions.length == 0) {
            // no inversions match
            return false;
        }
        if (!td.inversion_identified || td.identified_inversion==-1) {//TODO: fix this
            // chord is compatible and no inversion chosen yet
            return true;
        }
        if (correct_inversions.indexOf(td.identified_inversion) > -1) {
            // chosen inversion is compatible
            return true;
        } else {
            // inversion is wrong even though chord is right; fail
            return false;
        }
    }

    td.checkInversionAnswer = function(inversion) {
        var compatible_chords = td.getInversionChords(inversion);
        console.log(compatible_chords);
        if (compatible_chords.length == 0) {
            // no chords match
            return false;
        }
        if (!td.chord_identified) {
            // inversion is compatible and no chord chosen yet
            return true;
        }
        if (compatible_chords.indexOf(td.identified_chord) > -1) {
            // chosen chord is compatible
            return true;
        } else {
            // chord is right even though inversion is wrong; fail
            return false;
        }
    }

    td.onAnswerBtnClick = function() {
	//console.log(td.inversion_identified);
	var choice = $(this).attr('answer');
	if(!td.checkChordAnswer(choice)) {
	    //incorrect answer
	    $(this).parent().find('.quiz-messages').html("Nope, \""+ $(this).html() + "\" is not correct.");
	    $(this).addClass('btn-danger');
	    if(!td.attempted_answer) {
		td.updateScore(false);
		if(td.answer_name in td.incorrect_answers) {
		    td.incorrect_answers[td.answer_name]+=1;
		} else {
		    td.incorrect_answers[td.answer_name]=1;
		}
		td.attempted_answer = true;
	    }
	} else {
	    //correct answer
	    td.identified_chord = choice;
	    $(this).parent().find('.quiz-messages').html("<em>Nice!</em> \""+ $(this).html() + "\" is correct!");
	    $(this).addClass('btn-success');
	    if(!td.attempted_answer){
		if(td.inversion_identified) td.updateScore(true);
		if(td.answer_name in td.correct_answers) {
		    td.correct_answers[td.answer_name]+=1;
		} else {
		    td.correct_answers[td.answer_name]=1;
		}
	    }
	    if(td.inversion_identified) {
		$('#hear-next').show();
		td.onCorrectAnswer();
		if(td.checkIfFinished()) return;
		if(td.auto_proceed) {
		    $('#hear-next').click();
		}
	    }
	    td.chord_identified = true;
	    $(this).siblings().unbind();
	    $(this).unbind();
	}
    }

    td.onInversionBtnClick = function() {
	var choice = Number($(this).attr('answer'));
	if(!td.checkInversionAnswer(choice)) {
	    //incorrect answer
	    $(this).parent().find('.quiz-messages').html("Nope, \""+ $(this).html() + "\" is not correct.");
	    $(this).addClass('btn-danger');
	    if(!td.attempted_answer) {
		td.updateScore(false);
		td.attempted_answer = true;
	    }
	} else {
	    //correct answer
	    td.identified_inversion = choice;
	    $(this).parent().find('.quiz-messages').html("<em>Nice!</em> \""+ $(this).html() + "\" is correct!");
	    $(this).addClass('btn-success');
	    if(!td.attempted_answer){
		if(td.chord_identified) td.updateScore(true);
	    }
	    if(td.chord_identified) {
		$('#hear-next').show();
		td.onCorrectAnswer();
		if(td.checkIfFinished()) return;
		if(td.auto_proceed) {
		    $('#hear-next').click();
		}
	    }
	    td.inversion_identified = true;
	    $(this).siblings().unbind();
	    $(this).unbind();
	}		
    }

    td.onCorrectAnswer = function() {
	//TODO:Need to properly use flats vs sharps -- this always uses flats.
	//You don't want to say that Emajor is E, Ab, B
	/*
	$('#quiz-messages').append(' The notes are ');
	for(var i = 0; i<td.chord.length; ++i) {
	    var note=MIDI.noteToKey[td.chord[i]].slice(0,-1);
	    note = note.replace("b","&#9837;");//flat symbol
	    $('#quiz-messages').append(note);
	    if(i!=td.chord.length-1) {
		$('#quiz-messages').append(", ");
	    }
	}
	$('#quiz-messages').append(".");
	*/
//	$('#quiz-messages').append(' The notes of this chord are '+td.chord_descriptions[td.answer]+".");
	    $('#quiz-messages').append(' The notes of this chord are '+td.chord_descriptions[$(".answer-btn.btn-success").attr("answer")]+".");
    }

    $('#hear-individual').fastClick(function() {
	MIDI.stopAllNotes();
	for (var i = 0; i < td.chord.length; ++i) {
	    MIDI.noteOn(0, td.chord[i], 127, .5*i);
	}
    });

    $('.quickstart-inversion').on('click',function(e){
	if(!this.checked){
	    if(!$('.quickstart-inversion:checked').length) {
		e.preventDefault();
		return false;
	    }
	}
    });

    $('.inversion').on('click',function(e){
	if(!this.checked){
	    if(!$('.inversion:checked').length) {
		e.preventDefault();
		return false;
	    }
	}
    });
};
