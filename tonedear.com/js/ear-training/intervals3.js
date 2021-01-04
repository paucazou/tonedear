window.onload = function () {
    td = new Exercise();
    //td.note1Delay = 0;
    //td.note2Delay = .8;
    td.delay = 0; // == harmonic

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
        td.interval_number = $('#quickstart-interval-number').val();
        console.log("Interval number");
        console.log(td.interval_number);
    }

    td.setupQuiz = function(el) {
	//Choose delay between notes
	var speed = $('#speed option:selected').val();
	var interval_type=$('#interval-type option:selected').val();
        console.log("Interval type: ",interval_type);
	var delay = td.delays[speed];
        if (interval_type != 'harm') {
            td.delay = delay;
        }
        else {td.delay = 0;}
        console.log("Delay: ",td.delay);
        /*
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
        */

	//Choose interval
	//td.interval = Number($(el).attr('interval'));
	//td.answer = Number($(el).attr('answer'));

        td.intervals = [];
        td.answers = [];
        var toggle_chosen = [];
        for (var i=0;i<td.interval_number;++i) {
            var elt = td.chooseToggleButton();
            // avoid using the same interval twice or more
            if (toggle_chosen.indexOf(elt) == -1) {
                toggle_chosen.push(elt);
                td.intervals.push(Number($(elt).attr('interval')));
                td.answers.push( Number($(elt).attr('answer')));
            }
            else {
                --i;
            }
        }
        console.log('Intervals and answers arrays');
        console.log(td.intervals);
        console.log(td.answers);

	//Choose root note
	if($('#fixed-root-toggle').hasClass('down')) {
	    td.root_note = 40+Math.floor(Math.random()*25);
	} else {
	    td.root_note = 45;
	}
    }
    function playInterval(root, interval) {
	MIDI.stopAllNotes();
        MIDI.noteOn(0, root, 127, 0);
        var previous = root;
        var delay = td.delay;
        td.intervals.forEach(function(item, index, array) {
            console.log(item, index);
            if (td.delay > 0) {
                MIDI.noteOff(0, previous, delay);
            }
            var current = root + item;
            MIDI.noteOn(0, current, 127, delay);
            previous = current;
            delay = delay + delay;
        })
        
        /*
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
        */
    }
    td.hearQuiz = function() {
	playInterval(td.root_note, td.interval);
    }
    $('.listen-btn').fastClick(function() {
	playInterval(td.root_note,Number($(this).prev().attr('interval')));
    });
};
