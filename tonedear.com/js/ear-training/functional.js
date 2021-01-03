window.onload = function () {
    td = new Exercise();

    td.note_name = "do";
    td.note_octave = "4";
    td.note_interval = 0;
    td.note_adjustment = 0;
    td.major_scale = [0, 2, 4, 5, 7, 9, 11, 12];

    var origSetOptions = td.setOptions;
    td.setOptions = function() {
	    origSetOptions();
        td.hide_parentheses = $('#quickstart-hide-names').is(':checked');
        if(td.hide_parentheses) $(".solfege-name").hide();
        else $(".solfege-name").show();
    };

    td.setupQuiz = function(el) {
	$('#hear-after-answer').hide();

	//Choose chord
	td.note_adjustment = (Math.floor(Math.random()*3)-1)*12; //either -12, 0, or 12, to randomize the octave
	td.note_interval = Number($(el).attr('interval'));
	td.note_name = $(el).attr('note');
	td.answer = $(el).attr('note');

	//Choose root note
	if($('#fixed-root-toggle').hasClass('down')) {
	    td.root_note = 40+Math.floor(Math.random()*25);
	} else {
	    td.root_note = 45;
	}
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
	MIDI.chordOff(0, chordI(td.root_note), 2.0);

	MIDI.noteOn(0, td.root_note+td.note_interval+td.note_adjustment, 127, 2.5);
    }

    td.onCorrectAnswer = function() {
	$('#hear-after-answer').show();
    }

    $('#hear-descend').fastClick(function() {
	var descending_notes = td.major_scale.filter(function(el) { return el < td.note_interval; });
	descending_notes.reverse();
	MIDI.stopAllNotes();
	MIDI.noteOn(0, td.root_note+td.note_interval+td.note_adjustment, 127, 0);
	MIDI.noteOff(0, td.root_note+td.note_interval+td.note_adjustment, .5);
	for (var i = 0; i < descending_notes.length; ++i) {
	    MIDI.noteOn(0,td.root_note+descending_notes[i]+td.note_adjustment, 127, .5+i*.5);
	    MIDI.noteOff(0,td.root_note+descending_notes[i]+td.note_adjustment, 1+i*.5);
	}
    });

    $('#hear-ascend').fastClick(function() {
	var ascending_notes = td.major_scale.filter(function(el) { return el > td.note_interval; });
	MIDI.stopAllNotes();
	MIDI.noteOn(0, td.root_note+td.note_interval+td.note_adjustment, 127, 0);
	MIDI.noteOff(0, td.root_note+td.note_interval+td.note_adjustment, .5);
	ascending_notes.forEach(function(e, i, a) { 
	    MIDI.noteOn(0, td.root_note+e+td.note_adjustment, 127, .5+i*.5);
	    MIDI.noteOff(0, td.root_note+e+td.note_adjustment, 1+i*.5);
	});
    });

};
