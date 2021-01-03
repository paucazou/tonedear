window.onload = function () {
    td = new Exercise();

    td.note_name = "do";
    td.note_name2 = "do";
    td.answer_name = "1 (do)"
    td.answer_name2 = "1 (do)"
    td.note_interval = 0;
    td.note_interval2 = 0;
    td.note_adjustment = 0;
    td.note_adjustment2 = 0;
    td.major_scale = [0, 2, 4, 5, 7, 9, 11, 12];
    td.note_1_identified = false;
    td.note_2_identified = false;
    td.note_1_attempted = false;
    td.note_2_attempted = false;
    td.interval_identified = false;
    td.interval_type = "both";

    function chordI(root_note) {
	return [root_note, root_note+4, root_note+7];
    }
    function chordIV(root_note) {
	return [root_note+5, root_note+9, root_note+12];
    }
    function chordV(root_note) {
	return [root_note+7, root_note+11, root_note+14];
    }

    var origSetOptions = td.setOptions;
    td.setOptions = function() {
	    origSetOptions();
	    td.hide_parentheses = $('#quickstart-hide-names').is(':checked');
        if(td.hide_parentheses) $(".solfege-name").hide();
        else $(".solfege-name").show();
        $('#interval-type').val($('#quickstart-interval-type').val());
    }

    td.setupQuiz = function(el) {
	$('#quiz-messages').empty();
	$('#quiz-messages-note1').empty();
	$('#quiz-messages-note2').empty();
	$('#quiz-messages-interval').empty();
	$('.answer-btn').removeClass("btn-danger");
	$('.answer-btn').removeClass("btn-success");
	td.attempted_answer=false;
	td.note_1_identified=false;td.note_2_identified=false;td.interval_identified=false;
	td.note_1_attempted=false;td.note_2_attempted=false;
	disableAnswerHotkeys();

	//Choose root note
	if($('#fixed-root-toggle').hasClass('down')) {
	    td.root_note = 40+Math.floor(Math.random()*25);
	} else {
	    td.root_note = 45;
	}

	//Choose quiz note
	td.interval_type = $('#interval-type option:selected').val();
	if(td.interval_type=='harm') {
	    $('#note1-header').html('Lower Note');
	    $('#note2-header').html('Higher Note');
	} else {
	    $('#note1-header').html('Note 1');
	    $('#note2-header').html('Note 2');
	}
	var toggle_buttons = $(".interval-toggle").not('.down');

	//Keep randomly picking notes until the interval is <= an octave and the direction (asc/desc) is correct
	do {
	    var el = toggle_buttons[randomInt(toggle_buttons.length)];
	    td.note_adjustment = (Math.floor(Math.random()*3)-1)*12; //either -12, 0, or 12, to randomize the octave
	    td.note_interval = Number($(el).attr('interval'));
	    td.note_name = $(el).attr('note');
	    td.answer_name = $(el).html();

	    var el2 = toggle_buttons[randomInt(toggle_buttons.length)];
	    td.note_interval2 = Number($(el2).attr('interval'));
	    td.note_name2 = $(el2).attr('note');
	    td.answer_name2 = $(el2).html();
	    td.note_adjustment2 = (Math.floor(Math.random()*3)-1)*12;

	    var interval_size_is_bad = Math.abs(td.note_interval2+td.note_adjustment2 - (td.note_interval+td.note_adjustment)) > 12;
	    if(td.interval_type=='asc') {
		var direction_is_bad = (td.note_interval2+td.note_adjustment2)-(td.note_interval+td.note_adjustment) < 0;
	    } else if (td.interval_type=='desc') {
		var direction_is_bad = (td.note_interval2+td.note_adjustment2)-(td.note_interval+td.note_adjustment) > 0;
	    } else if (td.interval_type=='harm') {
		var direction_is_bad = (td.note_interval2+td.note_adjustment2)-(td.note_interval+td.note_adjustment) <= 0;
	    } else {
		direction_is_bad=false;
	    }
	} while(direction_is_bad || interval_size_is_bad)
	

    }

    td.hearQuiz = function() {
	MIDI.stopAllNotes();
	MIDI.chordOn(0, chordI(td.root_note), 127, 0);
	MIDI.chordOff(0, chordI(td.root_note), .5);
	MIDI.chordOn(0, chordIV(td.root_note), 127, .5);
	MIDI.chordOff(0, chordIV(td.root_note), 1);
	MIDI.chordOn(0, chordV(td.root_note), 127, 1);
	MIDI.chordOff(0, chordV(td.root_note), 1.5);
	MIDI.chordOn(0, chordI(td.root_note), 127, 1.5);
	MIDI.chordOff(0, chordI(td.root_note), 2.25);

	if(td.interval_type == "harm") var note_2_delay = 0;
	else var note_2_delay = .5;

	MIDI.noteOn(0, td.root_note+td.note_interval+td.note_adjustment, 127, 2.5);
	if(note_2_delay > 0) {
	    MIDI.noteOff(0, td.root_note+td.note_interval+td.note_adjustment, 2.5+note_2_delay);
	}
	MIDI.noteOn(0, td.root_note+td.note_interval2+td.note_adjustment2, 127, 2.5 + note_2_delay);
    }
    
    td.displayAnswerChoices = function() {
	var toggle_buttons = $(".interval-toggle").not('.down');
	//Display answer choice buttons
	$('#answer-choices-1').empty();
	$('#answer-choices-2').empty();
	$('#answer-choices').css('visibility', 'visible');
	for (i = 0; i < toggle_buttons.length; ++i) {
	    var choice_note = $(toggle_buttons[i]).attr('note');
	    var choice_name = $(toggle_buttons[i]).html();
	    var hotkey = $(toggle_buttons[i]).attr('hotkey');
	    $('#answer-choices-1').append('<a id="answer-btn-1-'+hotkey+'" class="btn btn-primary answer-btn answer-btn-note1" answer_type="note1" note="'+choice_note+'" hotkey="'+hotkey+'">'+choice_name+'</a> ');
	    $('#answer-choices-2').append('<a id="answer-btn-2-'+hotkey+'" class="btn btn-primary answer-btn answer-btn-note2" answer_type="note2" note="'+choice_note+'" hotkey="'+hotkey+'">'+choice_name+'</a> ');
	}
	if(td.enable_hotkeys) {
	    enableAnswerHotkeys(1);
	}
    }

    td.onAnswerBtnClick = function() {
	var answer_type = $(this).attr('answer_type')
	if(answer_type=='interval') {
	    var choice = $(this).attr('interval');
	    var correct_answer = Math.abs(td.note_interval+td.note_adjustment-(td.note_interval2+td.note_adjustment2));
	} else {
	    var choice = $(this).attr('note');
	    if(answer_type=='note1') { var correct_answer = td.note_name;var answer_name = td.answer_name; }
	    else if(answer_type=='note2') { var correct_answer = td.note_name2;var answer_name = td.answer_name2; }
	}
	if(choice != correct_answer) {
	    //incorrect answer
	    $('#quiz-messages-'+answer_type).html("Nope, \""+ $(this).html() + "\" is not correct.");
	    $(this).addClass('btn-danger');
	    if(!td.attempted_answer) {
		td.updateScore(false);
	    }
	    if((answer_type=="note1" && !td.note_1_attempted) || (answer_type=="note2" && !td.note_2_attempted)) {
		if(answer_name in td.incorrect_answers) {
		    td.incorrect_answers[answer_name]+=1;
		} else {
		    td.incorrect_answers[answer_name]=1;
		}
	    }
	    if(answer_type=="note1") { td.note_1_attempted=true; }
	    if(answer_type=="note2") { td.note_2_attempted=true; }
	    td.attempted_answer = true;
	} else {
	    //correct answer
	    $('.answer-btn-'+answer_type).unbind();
	    $(this).addClass('btn-success');
	    $('#quiz-messages-'+answer_type).html("<em>Nice!</em> \""+ $(this).html() + "\" is correct!");
	    if((answer_type=="note1" && !td.note_1_attempted) || (answer_type=="note2" && !td.note_2_attempted)) {
		if(answer_name in td.correct_answers) {
		    td.correct_answers[answer_name]+=1;
		} else {
		    td.correct_answers[answer_name]=1;
		}
	    }
	    if(answer_type=="note1") { 
		td.note_1_identified=true;
		td.note_1_attempted=true;
		if(!td.note_2_identified) enableAnswerHotkeys(2);
		else if(!td.interval_identified) enableAnswerHotkeys(3);
	    }
	    if(answer_type=="note2") {
		td.note_2_identified=true;
		td.note_2_attempted=true;
		if(!td.interval_identified && td.note_1_identified) enableAnswerHotkeys(3);
	    }
	    if(answer_type=="interval") td.interval_identified = true;
	    if(td.note_1_identified && td.note_2_identified && td.interval_identified) {
		$('#hear-next').show();
		if(!td.attempted_answer){
		    td.updateScore(true);
		}
		if(td.checkIfFinished()) return;
		if(td.auto_proceed) {
		    $('#hear-next').click();
		}
	    }
	}
    };

    function disableAnswerHotkeys() {
        $(document).unbind('keydown.answers');
        $(".answer-btn").each(function() {
	    $(this).find("sup").remove();
        });
    }
    function enableAnswerHotkeys(div_num) {
	if(td.enable_hotkeys) {
	    
	    disableAnswerHotkeys();
	    $("#answer-choices-"+div_num).children().each(function() {
		console.log($(this));
		var hotkey = $(this).attr('hotkey');
		$(this).append(" <sup>["+hotkey+"]</sup>");
		
		var div = $(this);
		$(document).bind('keydown.answers', hotkey, function() {
		    div.click();
		});
	    });
	}
    }
};
