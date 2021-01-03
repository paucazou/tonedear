window.onload = function () {
    td = new Exercise();

    td.melody=[0,2,4, 5];
    td.notes_identified=[false,false,false,false];
    td.melody_length=4;
    
    td.delays = { "fast":.45,
		          "medium":.9,
		          "slow":1.3
		        }

    var enharmonics = { "Ab":"G#", "G#":"Ab",
                        "Bb":"A#", "A#":"Bb",
                        "Cb":"B#", "B#":"Cb",
                        "Db":"C#", "C#":"Db",
                        "Eb":"D#", "D#":"Eb",
                        "Fb":"E#", "E#":"Fb",
                        "Gb":"F#", "F#":"Gb",
                      }
    
    var origSetOptions = td.setOptions;
    td.setOptions = function() {
	    origSetOptions();
	    td.melody_length = Number($('#quickstart-melody-length').val());
	    td.melody_length = Math.min(10, Math.max(2, td.melody_length));//2<=length<=10
	    
        td.hide_parentheses = $('#quickstart-hide-names').is(':checked');
        if(td.hide_parentheses) $(".solfege-name").hide();
        else $(".solfege-name").show();

	    $('#speed').val($('#quickstart-speed').val());
	    var canvas = $("#answer-staff")[0]
	    $("#answer-staff").empty();
	    var ctx = canvas.getContext("2d");
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    td.setupQuiz = function(el) {
	    td.speed = $('#speed option:selected').val();
	    td.num_correct=0;
	    td.notes_identified=new Array(td.melody_length);
	    for(var i=0; i< td.melody_length; ++i) td.notes_identified[i]=false;
	    td.attempted_answer=new Array(td.melody_length);
	    for(var i=0; i < td.attempted_answer.length; ++i) td.attempted_answer[i] = false;
        
	    //Choose root note
	    if($('#fixed-root-toggle').hasClass('down')) {
	        td.root_note = 58+Math.floor(Math.random()*12);
	    } else {
	        td.root_note = 58;
	    }
        
	    //Choose melody
	    var toggle_buttons = $(".interval-toggle").not('.down');
	    td.melody = new Array(td.melody_length);
        
	    for (var i = 0; i < td.melody.length; ++i) {
	        var el = toggle_buttons[randomInt(toggle_buttons.length)];
	        var octave_adjust = (Math.floor(Math.random()*3)-1)*12; //either -12, 0, or 12, to randomize the octave
	        var interval = Number($(el).attr('interval'));
	        while(i>0 && Math.abs(td.melody[i-1].interval-(octave_adjust+interval))>12) {
		        //We don't want leaps greater than an octave
		        octave_adjust = (Math.floor(Math.random()*3)-1)*12; //either -12, 0, or 12, to randomize the octave
	        }
	        //console.log(td.melody[i-1]);
	        //console.log(octave_adjust+interval);
	        interval+=octave_adjust;
	        var note = interval + td.root_note
	        var note_name = MIDI.noteToKey[note];
	        var index = note_name.search("/\d+/");
            var root_note_name = MIDI.noteToKey[td.root_note];
            if(root_note_name.indexOf("b")==-1) {
                //We need to replace flats with sharps for certain keys
                var init_name = note_name.slice(0,index);
                if(init_name.indexOf("b")>-1) note_name = enharmonics[init_name]+note_name.slice(index);
            }
	        var vexflow_note_name = note_name.slice(0,index)+"/"+note_name.slice(index);

	        td.melody[i] = { 'interval': interval,
			                 'note': $(el).attr('note'),
			                 'answer': $(el).attr('answer'),
			                 'name': $(el).html(),
			                 'vexflow_note_name': vexflow_note_name,
			               };
	    }
    };
    
    td.hearQuiz = function() {
	    MIDI.stopAllNotes();
	    MIDI.chordOn(0, chordI(td.root_note), 127, 0);
	    MIDI.chordOff(0, chordI(td.root_note), .5);
        
	    MIDI.chordOn(0, chordIV(td.root_note), 127, .5);
	    MIDI.chordOff(0, chordIV(td.root_note), 1);
        
	    MIDI.chordOn(0, chordV(td.root_note), 127, 1);
	    MIDI.chordOff(0, chordV(td.root_note), 1.5);
        
	    MIDI.chordOn(0, chordI(td.root_note), 127, 1.5);
	    MIDI.chordOff(0, chordI(td.root_note), 2.0);
        
	    var delay = td.delays[td.speed];
	    //MIDI.stopAllNotes();
	    for (var i = 0; i < td.melody.length; ++i) {
	        MIDI.noteOn(0, td.root_note+td.melody[i]['interval'], 127, 2.5+delay*i);
	        MIDI.noteOff(0, td.root_note+td.melody[i]['interval'], 2.5+delay+delay*i);
	    }
    };
    
    td.drawMelody = function() {
	    var canvas = $("#answer-staff")[0];
	    canvas.width=$("#answer-staff").parent().width();
        
	    var renderer = new Vex.Flow.Renderer(canvas,
					                         Vex.Flow.Renderer.Backends.CANVAS);
	    var ctx = renderer.getContext();
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
        
	    var stave = new Vex.Flow.Stave(10, 30, canvas.width-20);
	    stave.addClef("treble").setContext(ctx).draw();
        
	    var notes = [];
	    var font_size=18;
	    var font_weight="bold";
	    for (var i=0; i< td.melody.length; ++i) {
	        if(!td.notes_identified[i]) {
		        notes.push(new Vex.Flow.TextNote({
		            text: "?",
		            font: {
			            family: "Arial",
			            size: font_size,
			            color: "green",
			            weight: font_weight
		            },
		            duration: 'q'               
		        }).setLine(5.7).setStave(stave).setJustification(Vex.Flow.TextNote.Justification.CENTER)
			              );
		        font_size=14;
		        font_weight="";
	        } else {
                var stave_note = new Vex.Flow.StaveNote({ keys: [td.melody[i].vexflow_note_name], duration: "q" });
                if(td.melody[i].vexflow_note_name.indexOf("b")>-1) {
                    stave_note.addAccidental(0, new Vex.Flow.Accidental("b"));
                } else if(td.melody[i].vexflow_note_name.indexOf("#")>-1) {
                    stave_note.addAccidental(0, new Vex.Flow.Accidental("#"));
                }
		        notes.push(stave_note);
	        }
            
	    }
        
	    var voice = new Vex.Flow.Voice({
	        num_beats: td.melody.length,
	        beat_value: 4,
	        resolution: Vex.Flow.RESOLUTION
	    });
	    
	    // Add notes to voice
	    voice.addTickables(notes);
        
	    // Format and justify the notes to 500 pixels
	    var formatter = new Vex.Flow.Formatter().
	        joinVoices([voice]).format([voice], canvas.width-20);
	    
	    // Render voice
	    voice.draw(ctx, stave);
    };
    
    td.displayAnswerChoices = function() {
	    td.drawMelody();
	    var toggle_buttons = $(".interval-toggle").not('.down');
	    $('#answer-choices').empty();
	    $('#answer-choices').css('visibility', 'visible');
	    for(var i = 0; i < td.melody.length; ++i) {
	        $('#answer-choices').append('<div class="row answer-row" id="answer-row-'+i+'"><div class="col-md-2"><strong>Note '+(i+1)+':</strong><br><div id="note-msg-'+i+'" class="note-msg"></div></div><div id="answer-choices-'+i+'" class="col-md-10 note-choices"><div class="row1"></div><div class="row2"></div></div></div>');
	        for(var j = 0; j < toggle_buttons.length; ++j) {
		        var choice_note = $(toggle_buttons[j]).attr('answer');
		        var choice_name = $(toggle_buttons[j]).html();
		        var hotkey = $(toggle_buttons[j]).attr('hotkey');
		        $('#answer-choices-'+i+" > .row"+$(toggle_buttons[j]).attr('row')).append('<a id="answer-btn-'+i+'-'+j+'" class="btn btn-primary answer-btn" note_num="'+i+'"note="'+choice_note+'" hotkey="'+hotkey+'">'+choice_name+'</a> ');
		        $(".answer-row").hide();
		        $("#answer-row-0").show();
	        }
	    }
	    if(td.enable_hotkeys) {
	        enableAnswerHotkeys(0);
	    }
    };
    
    td.onAnswerBtnClick = function() {
	    //Set up listeners for each answer choice
	    var choice_note = $(this).attr('note');
	    var note_num = $(this).attr('note_num');
	    if(choice_note != td.melody[note_num]['note']) {
	        //incorrect answer
	        $('#note-msg-'+note_num).html("Nope, "+ $(this).html() + " is not right.");
	        $(this).addClass('btn-danger');
	        if(!td.attempted_answer[note_num]) {
		        var num_attempted = 0;
		        for(var i=0;i<td.attempted_answer.length;i++){
		            if(td.attempted_answer[i]) num_attempted++;
		        }
		        if(num_attempted==0) td.updateScore(false);
		        td.attempted_answer[note_num] = true;
                
		        var answer_name = td.melody[note_num]['name'];
		        if(answer_name in td.incorrect_answers) {
		            td.incorrect_answers[answer_name]+=1;
		        } else {
		            td.incorrect_answers[answer_name]=1;
		        }
	        }
	    } else {
	        //correct answer
	        $(this).parent().parent().children().children().off();
	        $(this).addClass('btn-success');
	        $('#note-msg-'+note_num).html("<em>Nice!</em> \""+ $(this).html() + "\" is correct!");
	        $(".answer-row").hide();
	        $("#answer-row-"+(Number(note_num)+1)).show();
	        td.notes_identified[note_num] = true;
	        td.drawMelody();
	        if(!td.attempted_answer[note_num]){
		        td.attempted_answer[note_num] = true;
		        td.num_correct+=1;
		        if(td.num_correct==td.melody_length) { 
		            var answer_name = td.melody[note_num]['name'];
		            if(answer_name in td.correct_answers) {
			            td.correct_answers[answer_name]+=1;
		            } else {
			            td.correct_answers[answer_name]=1;
		            }
		            td.updateScore(true);
		        }
	        }
	        for(var i=0; i<td.melody.length; ++i) {
		        if(!td.notes_identified[i] && td.enable_hotkeys) {
		            enableAnswerHotkeys(i);
		            break;
		        }
	        }
	        if($(".answer-btn.btn-success").length==td.melody_length) {
		        $("#choices-header").css({ visibility:"hidden" });
		        $('#hear-next').show();
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
	    disableAnswerHotkeys();
	    $("#answer-choices-"+div_num).find(".answer-btn").each(function() {
	        var hotkey = $(this).attr('hotkey');
	        $(this).append(" <sup>["+hotkey+"]</sup>");
            
	        var div = $(this);
	        $(document).bind('keydown.answers', hotkey, function() {
		        div.click();
	        });
	    });
    }
};
