window.onload = function () {
    td = new Exercise();
    td.note1Delay = 0;
    td.note2Delay = .8;

    td.delays = { "fast":.4,
		  "medium":.8,
		  "slow":1
		}

    var origSetOptions = td.setOptions;
    td.setOptions = function() {
	origSetOptions();
	$('#interval-type').val($('#quickstart-interval-type').val());
	$('#quickstart-speed').val($('#speed').val());
	td.listen_enabled = $('#quickstart-listen').is(':checked');
	if(td.listen_enabled) {
	    $(".listen-btn").show();
	} else {
	    $(".listen-btn").hide();
	}
    }

    td.setupQuiz = function(el) {
	//Choose delay between notes
	var speed = $('#speed option:selected').val();
	var interval_type=$('#interval-type option:selected').val();
	var delay = td.delays[speed];
	if(interval_type=="asc") {
	    td.note1Delay=0;
	    td.note2Delay=delay;
	} else if(interval_type=="desc") {
	    td.note1Delay=delay;
	    td.note2Delay=0;
	} else if(interval_type=="both") {
	    if(Math.random()>.5) {
		td.note1Delay=0;
		td.note2Delay=delay;
	    } else {
		td.note1Delay=delay;
		td.note2Delay=0;
	    }
	} else if(interval_type=="harm") {
	    td.note1Delay=0;
	    td.note2Delay=0;
	}

	//Choose interval
	td.interval = Number($(el).attr('interval'));
	td.answer = Number($(el).attr('answer'));

	//Choose root note
	if($('#fixed-root-toggle').hasClass('down')) {
	    td.root_note = 40+Math.floor(Math.random()*25);
	} else {
	    td.root_note = 45;
	}
    }
    function playInterval(root, interval) {
	//Bit of a mess. TODO: clean this up. note1 could actually come after note2.
	MIDI.stopAllNotes();
	MIDI.noteOn(0, root, 127, td.note1Delay);
	if(td.note2Delay>0) {
	    MIDI.noteOff(0, root, td.note2Delay);
	} else if(td.note1Delay>0) {
	    MIDI.noteOff(0, root, td.note1Delay*2);
	}
	MIDI.noteOn(0, root+interval, 127, td.note2Delay);
	if(td.note2Delay>0) {
	    MIDI.noteOff(0, root+interval, td.note2Delay*2);
	} else if(td.note1Delay>0) {
	    MIDI.noteOff(0, root+interval, td.note1Delay);
	}
    }
    td.hearQuiz = function() {
	playInterval(td.root_note, td.interval);
    }
    $('.listen-btn').fastClick(function() {
	playInterval(td.root_note,Number($(this).prev().attr('interval')));
    });
};
