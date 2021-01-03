window.onload = function () {
    td = new Exercise();
    
    td.chord_types = {
        "maj": [0, 4, 7],
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
    }
    
    td.delays = { "fast":.45,
                  "medium":.9,
                  "slow":1.3
                }
    
    function constructChord(root, chord_array) {
        //chordArray should be in the format of semitones-from-root, e.g. [0, 4, 7] for a major triad
        for (i = 0; i < chord_array.length; ++i) {
            chord_array[i]+=root;
        }
        return chord_array;
    }
    
    
    var origSetOptions = td.setOptions;
    td.setOptions = function() {
        origSetOptions();
        td.num_chords = Math.max(2,Number($('#quickstart-progression-length').val()));
        $('#speed').val($('#quickstart-speed').val());
        
    }
    
    td.setupQuiz = function(el) {
        td.speed = $('#speed option:selected').val();
        
        td.attempted_answer=new Array(td.num_chords);
        td.attempted_answer[0]=true;
        for (var i = 1; i < td.attempted_answer.length; ++i) { td.attempted_answer[i] = false; }
        td.num_correct=0;
        
        //Choose progression
        var toggle_buttons = $(".interval-toggle").not('.down');
        td.progression = new Array(td.num_chords);
        td.progression[0]={'chord':"I", 'type':'maj','offset':0};
        for (var i = 1; i < td.progression.length; ++i) {
            var el = toggle_buttons[randomInt(toggle_buttons.length)];
            td.progression[i] = { 'chord': $(el).attr('chord'),
                                  'type': $(el).attr('type'),
                                  'offset': Number($(el).attr('offset')),
                                  'name': $(el).html()
                                };
        }
        
        //Choose root note
        if($('#fixed-root-toggle').hasClass('down')) {
            td.root_note = 55+Math.floor(Math.random()*18);
        } else {
            td.root_note = 62;
        }
    }
    
    td.hearQuiz = function() {
        var delay = td.delays[td.speed];
        MIDI.stopAllNotes();
        for (var i = 0; i < td.progression.length; ++i) {
            var chord = td.chord_types[td.progression[i]['type']].slice(0);//clone array
            chord = constructChord(td.root_note+td.progression[i]['offset'], chord);
            MIDI.chordOn(0, chord, 127, delay*i);
            MIDI.chordOff(0, chord, delay+delay*i);
        }
    }
    
    td.displayAnswerChoices = function() {
        var toggle_buttons = $(".interval-toggle").not('.down');
        $('#answer-choices').empty();
        $('#answer-choices').css({ visibility: "visible" });
        $('#answer-choices').append('<div class="row"><div class="col-md-2"><strong>Chord '+1+':</strong></div><div class="col-md-10 chord-choices"><div class="row1">Chord 1 in this exercise is always I, the tonic chord.</div><div class="row2"></div></div></div>');
        for (var i = 1; i < td.progression.length; ++i) {
            $('#answer-choices').append('<div class="row"><div class="col-md-2"><strong>Chord '+(i+1)+':</strong><br><div id="chord-msg-'+i+'" class="chord-msg"></div></div><div id="answer-choices-'+i+'" class="col-md-10 chord-choices"><div class="row1"></div><div class="row2"></div></div></div>');
            for (var j = 0; j < toggle_buttons.length; ++j) {
                var choice_chord = $(toggle_buttons[j]).attr('chord');
                var choice_name = $(toggle_buttons[j]).html();
                $('#answer-choices-'+i+" > .row"+$(toggle_buttons[j]).attr('row')).append('<a id="answer-btn-'+i+'-'+j+'" class="btn btn-primary answer-btn" chord_num="'+i+'"chord="'+choice_chord+'" >'+choice_name+'</a> ');
            }
        }   
    }
    
    td.onAnswerBtnClick = function() {
        //Set up listeners for each answer choice
        var choice_chord = $(this).attr('chord');
        var chord_num = $(this).attr('chord_num');
        if(choice_chord != td.progression[chord_num]['chord']) {
            //incorrect answer
            $('#chord-msg-'+chord_num).html("Nope, "+ $(this).html() + " is not right.");
            $(this).addClass('btn-danger');
            if(!td.attempted_answer[chord_num]) {
                var num_attempted = 0;
                for(var i=0;i<td.attempted_answer.length;i++){
                    if(td.attempted_answer[i]) num_attempted++;
                }
                if(num_attempted-td.num_correct<=1) td.updateScore(false);
                td.attempted_answer[chord_num] = true;
                
                var answer_name = td.progression[chord_num]['name'];
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
            $('#chord-msg-'+chord_num).html("<em>Nice!</em> \""+ $(this).html() + "\" is correct!");
            if(!td.attempted_answer[chord_num]){
                td.attempted_answer[chord_num] = true;
                td.num_correct+=1;
                
                if(td.num_correct==td.num_chords-1) { 
                    var answer_name = td.progression[chord_num]['name'];
                    if(answer_name in td.correct_answers) {
                        td.correct_answers[answer_name]+=1;
                    } else {
                        td.correct_answers[answer_name]=1;
                    }
                    td.updateScore(true);
                }
            }
            if($(".answer-btn.btn-success").length==td.num_chords-1) {
                $('#hear-next').show();
                if(td.checkIfFinished()) return;
                if(td.auto_proceed) {
                    $('#hear-next').click();
                }
            }
        }
    };
};
