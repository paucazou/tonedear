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
	td.selected_delay = td.delays[speed];
        if (interval_type != 'harm') {
            td.delay = td.selected_delay;
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
        td.not_yet_answered = [];
        // is the number of intervals greater than the number of intervals possible?
        if ($(".interval-toggle").not('.down').length < td.interval_number) {
            alert("Number of intervals possible is lower than the number of intervals selected. Please fix that problem.");
            return;
            // TODO not fixed
        }
        var toggle_chosen = [];
        for (var i=0;i<td.interval_number;++i) {
            var elt = td.chooseToggleButton();
            // avoid using the same interval twice or more
            if (toggle_chosen.indexOf(elt) == -1) {
                toggle_chosen.push(elt);
                td.intervals.push(Number($(elt).attr('interval')));
                td.answers.push( Number($(elt).attr('answer')));
                td.not_yet_answered.push( Number($(elt).attr('answer')));
            }
            else {
                --i;
            }
        }
        td.intervals.sort(function(a, b){return a-b});
        td.answers.sort(function(a, b){return a-b});
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
        return __play_interval(root, interval, td.delay);
    }

    function playAsMelodic(root, interval) {
        return __play_interval(root, interval, td.selected_delay);
    }

    function __play_interval(root, interval, delay) {
	MIDI.stopAllNotes();
        MIDI.noteOn(0, root, 127, 0);
        var previous = root;
        td.intervals.forEach(function(item, index, array) {
            console.log(item, index);
            if (delay > 0) {
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

    td.onAnswerBtnClick = function () {
        var choice = Number($(this).attr('answer'));
        console.log("In onAnswerBtnClick: choice: ", choice);
        if (td.answers.indexOf(choice) == -1) {
            //incorrect answer
                $('#quiz-messages').html("Nope, \""+ $(this).html() + "\" is not correct.");
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
                $('#quiz-messages').html("<em>Nice!</em> \""+ $(this).html() + "\" is correct!");
                $(this).addClass('btn-success');
                // delete choice from not yet answered array
                var idx = td.not_yet_answered.indexOf(choice);
                // correct answer, but already given
                if (idx == -1) {
                    return;
                }
                td.not_yet_answered.splice(idx,1);
                if (td.not_yet_answered.length == 0) {
                $('#hear-next').show();
                if(!td.attempted_answer){
                        td.updateScore(true);
                        if(td.answer_name in td.correct_answers) {
                            td.correct_answers[td.answer_name]+=1;
                        } else {
                            td.correct_answers[td.answer_name]=1;
                        }
                        td.attempted_answer = true;
                }
                td.onCorrectAnswer();
                if(td.checkIfFinished()) return;
                if(td.auto_proceed) {
                        $('#hear-next').click();
                }
                }
            }

        }

    td.hearQuiz = function() {
	playInterval(td.root_note, td.interval);
    }
    $('.listen-btn').fastClick(function() {
	playInterval(td.root_note,Number($(this).prev().attr('interval')));
    });
};
