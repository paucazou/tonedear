window.onload = function () {
    td = new Exercise();
    
    td.scales =
	{ "major": [0, 2, 4, 5, 7, 9, 11, 12],
	  "dorian": [0, 2, 3, 5, 7, 9, 10, 12],
	  "phrygian": [0, 1, 3, 5, 7, 8, 10, 12],
	  "lydian": [0, 2, 4, 6, 7, 9, 11, 12],
	  "mixolydian": [0, 2, 4, 5, 7, 9, 10, 12],
	  "natmin": [0, 2, 3, 5, 7, 8, 10, 12], // aeolian
	  "locrian": [0, 1, 3, 5, 6, 8, 10, 12],
	  "harmin": [0, 2, 3, 5, 7, 8, 11, 12]
	  //"melminasc": [0, 2, 3, 5, 7, 9, 11, 12]
	}
	  

    var origSetOptions = td.setOptions;
    td.setOptions = function() {
	origSetOptions();
	$('#scale-direction').val($('#quickstart-direction').val());
    }

    td.setupQuiz = function(el) {
	td.scale_direction=$('#scale-direction option:selected').val();

	//Choose scale
	td.scale = $(el).attr('scale');
	td.answer = $(el).attr('answer');

	//Choose root note
	if($('#fixed-root-toggle').hasClass('down')) {
	    td.root_note = 40+Math.floor(Math.random()*25);
	} else {
	    td.root_note = 45;
	}
    }

    td.hearQuiz = function() {
	MIDI.stopAllNotes();
	var scale_notes = td.scales[td.scale].slice(0);
	if(td.scale_direction=='desc') {
	    scale_notes.reverse();
	}
	for(var i=0; i<scale_notes.length; ++i) {
	    MIDI.noteOn(0, td.root_note+scale_notes[i], 127, i*.55);
	    MIDI.noteOff(0, td.root_note+scale_notes[i], i*.55+.55);
	}
    }
};
