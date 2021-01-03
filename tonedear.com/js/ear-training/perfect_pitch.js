window.onload = function () {
    td = new Exercise();

    td.note_name = "A";
    td.note_octave = "4";

    td.setupQuiz = function(el) {
	//Choose chord
	td.note_name = $(el).attr('name');
	td.answer = $(el).attr('name');
	td.note_octave = randomInt(3)+3;
    }

    td.hearQuiz = function() {
	MIDI.stopAllNotes();
	MIDI.noteOn(0, MIDI.keyToNote[td.note_name+td.note_octave], 127, 0);
    }
};


