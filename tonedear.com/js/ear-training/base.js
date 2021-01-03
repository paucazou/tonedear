function Exercise () {
    var self=this; //Always use self instead of this to avoid confusion with "this" inside jquery click listeners
    self.answer = 0;
    self.root_note = 45;
    self.attempted_answer = false; //Represents whether the user has guessed the current interval yet
    self.auto_proceed = false;
    self.max_questions = 0;
    self.incorrect_answers = {};
    self.correct_answers = {};
    self.answer_name = "";

    MIDI.loadPlugin({
	    soundfontUrl: "/soundfont/",
	    instruments: ["acoustic_grand_piano"],//, "acoustic_guitar_nylon", "violin", "trumpet"],
	    onsuccess: function() {
	        //24 Acoustic Guitar (nylon)
	        
	        $("#loader").hide();
	        $("#quiz").show();
	    }
    });

    self.updateScore = function(is_correct) {
        var prog = Number($("#progress-bar").attr("aria-valuenow"));
        if(is_correct) prog = Math.min(prog+5,100);
        else prog = Math.max(prog-29,0);
        if(prog==100) {
            $("#progress-bar").attr("aria-valuenow",prog).css({width: prog+"%"});
            var choices = $(".interval-toggle.down");
            if(choices.filter("[difficulty-order]").length>0) {
                choices = choices.filter("[difficulty-order]");
                choices.sort(function (a, b) {
                    var contentA =parseInt( $(a).attr('difficulty-order'));
                    var contentB =parseInt( $(b).attr('difficulty-order'));
                    return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
                });
            }
            choices.first().removeClass("down");
            $("#level-up-text").show();
            prog = 0;

            setTimeout(function() { $("#progress-bar").attr("aria-valuenow",prog).css({width: prog+"%"}) }, 2300);
            setTimeout(function() { $("#level-up-text").hide(); }, 2300);
        } else {
            $("#progress-bar").attr("aria-valuenow",prog).css({width: prog+"%"});
        }
	    $('#total-reps').html(Number($('#total-reps').html())+1);
	    if(is_correct) {
	        $('#correct-reps').html(Number($('#correct-reps').html())+1);
	    }
    }
    
    self.chooseToggleButton = function () {
	    var toggle_buttons = $(".interval-toggle").not('.down');
	    var el = toggle_buttons[randomInt(toggle_buttons.length)];
	    return el;
    }
    
    self.setupQuiz = function(el) {
	    //el is a randomly chosen toggle button from the sidebar
	    console.log("setupQuiz() called (override this!)");
    }
    
    self.hearQuiz = function() {
	    console.log("hearQuiz() called (override this!)");
    }
    
    self.displayAnswerChoices = function() {
	    //For exercises with more than one required answer per question (e.g. chord progressions or intervals in context),
	    //you'll need to override this.
	    var toggle_buttons = $(".interval-toggle").not('.down');
	    $('#answer-choices').empty();
	    $('#answer-choices').css('visibility', 'visible');
	    for (var i = 0; i < toggle_buttons.length; ++i) {
	        var choice = $(toggle_buttons[i]).attr('answer');
	        var choice_name = $(toggle_buttons[i]).html();
	        var hotkey = $(toggle_buttons[i]).attr('hotkey');
	        $('#answer-choices').append('<a id="answer-btn-'+hotkey+'" class="btn btn-primary answer-btn" answer="'+choice+'" >'+choice_name+'</a> ');
            
	        if(self.enable_hotkeys) {
		        $("#answer-btn-"+hotkey).append(" <sup>["+hotkey+"]</sup>");
	        }
	    }
    }
    
    self.onCorrectAnswer = function() {
	    console.log("onCorrectAnswer() called (override this!)");
    }
    
    self.onAnswerBtnClick = function() {
	    var choice = $(this).attr('answer');
	    if(choice != self.answer) {
	        //incorrect answer
	        $('#quiz-messages').html("Nope, \""+ $(this).html() + "\" is not correct.");
	        $(this).addClass('btn-danger');
	        if(!self.attempted_answer) {
		        self.updateScore(false);
		        if(self.answer_name in self.incorrect_answers) {
		            self.incorrect_answers[self.answer_name]+=1;
		        } else {
		            self.incorrect_answers[self.answer_name]=1;
		        }
		        self.attempted_answer = true;
	        }
	    } else {
	        //correct answer
	        $('#quiz-messages').html("<em>Nice!</em> \""+ $(this).html() + "\" is correct!");
	        $(this).addClass('btn-success');
	        $('#hear-next').show();
	        if(!self.attempted_answer){
		        self.updateScore(true);
		        if(self.answer_name in self.correct_answers) {
		            self.correct_answers[self.answer_name]+=1;
		        } else {
		            self.correct_answers[self.answer_name]=1;
		        }
		        self.attempted_answer = true;
	        }
	        self.onCorrectAnswer();
	        if(self.checkIfFinished()) return;
	        if(self.auto_proceed) {
		        $('#hear-next').click();
	        }
	    }
    }
    
    self.checkIfFinished = function() {
	    var total_reps = Number($('#total-reps').html());
	    if(self.max_questions>0 && total_reps>=self.max_questions) {
	        self.finishQuiz();
	        return true;
	    } else {
	        return false;
	    }
    }
    self.finishQuiz = function() {
	    MIDI.stopAllNotes();
	    $(document).unbind('keypress');
	    $("#quiz-row").hide();
	    $("#finished-row").show();
	    $('#hear-next').show();
	    $("#finished-correct-reps").html($("#correct-reps").html());
	    $("#finished-total-reps").html($("#total-reps").html());
	    var percent = Number($("#correct-reps").html())/Number($("#total-reps").html());
	    $("#finished-percentage").html((percent*100).toFixed(2));
	    if(Number($("#total-reps").html())>0) {
	        $("#post-quiz-info").show();
	    } else {
	        $("#post-quiz-info").hide();
	    }
	    var toggle_buttons = $(".interval-toggle");
	    //toggle_buttons.sort(function(a,b) { return Number($(a).attr('interval'))-Number($(b).attr('interval')); });
	    toggle_buttons.each(function() {
	        var answer_name = $(this).html();
	        var number_wrong = self.incorrect_answers[answer_name];
	        if(number_wrong == undefined) { number_wrong=0; }
	        var number_right = self.correct_answers[answer_name];
	        if(number_right == undefined) { number_right=0; }
	        var number_heard = number_wrong+number_right;
	        var accuracy = 100*number_right/number_heard;
	        if(number_heard>0) {
		        $("#stats-table-body").append("<tr><td>"+answer_name+"</td><td>"+number_heard+"</td><td>"+number_wrong+"</td><td>"+accuracy.toFixed(2)+"%</td></tr>");
	        }
            
	    });
    }
    $(".btn-primary").on("touchstart", function(){ 
        $(this).removeClass("mobileHoverFixPrimary");
        $(this).addClass("touchStarted");
    });
    $(".btn-primary").on("touchend", function() { 
        if($(this).hasClass("touchStarted") && 
           $(this).hasClass("interval-toggle") &&
	       ($(".interval-toggle").not(".down").length!=1 || $(this).hasClass("down"))) {
            $(this).toggleClass("down");
        }
        $(this).addClass("mobileHoverFixPrimary");
        $(this).addClass("touchedToToggle");
        setTimeout(function() { $(this).removeClass("touchedToToggle"); }, 400);
    });
    $(".btn-default").on("touchstart", function(){ 
        $(this).removeClass("mobileHoverFixDefault");
    });
    $(".btn-default").on("touchend", function(){ 
        $(this).addClass("mobileHoverFixDefault");
    });
    $('.interval-toggle').click(function(){
	    //At least one interval must always be turned on; ignore click if user tries
	    //to unselect the last one
	    if($(".interval-toggle").not(".down").length!=1 || $(this).hasClass("down")) {
            if(!$(this).hasClass("touchedToToggle")) $(this).toggleClass("down");
	    }
    });
    $('#fixed-root-toggle').fastClick(function(){
        $(this).toggleClass("down");
    });
    
    $('#hear-next').fastClick(function(){
	    MIDI.programChange(0, 0);//Number($("#instrument").val()));
	    $('#hear-next-text').html("Hear Next");
	    $('#quiz-messages').empty();
	    $('#hear-next').hide();
	    $('#hear-again').show();
	    $('#choices-header').css('visibility', 'visible');
	    self.attempted_answer=false;
        
	    //Randomly choose an element from the selected toggle buttons in the sidebar
	    var el = self.chooseToggleButton();
	    self.answer_name = $(el).html();
        
	    //Set all variables for quiz (choose the question)
	    self.setupQuiz(el);
	    
	    //Play interval
	    self.hearQuiz();
	    
	    //Display answer choice buttons.
	    self.displayAnswerChoices();
	    
	    //Set up listeners for each answer choice
	    $('.answer-btn').fastClick(self.onAnswerBtnClick);
    });
    
    
    self.onHearAgain = function() {
	    self.hearQuiz();
    };
    $('#hear-again').fastClick(self.onHearAgain);
    
    self.setOptions = function() {
	    var toggles = $('#quickstart-toggles').val();
	    $('.interval-toggle').addClass('down');
	    $('.interval-toggle.'+toggles).removeClass('down');
	    $('#speed').val($('#quickstart-speed').val());
	    $('#instrument').val($("#quickstart-instrument").val());
    };
    
    self.onStartQuiz = function() {
	    $('#hear-next-text').html("Hear First Question");
	    $('#quickstart-row').hide();
	    $('#quiz-row').show();

        var scrollTop = $(document).scrollTop();
        var quizTop = $("#quiz-row").offset().top;
        if($(".navbar-fixed-top").length) {
            quizTop-=60;
        } else {
            quizTop-=15;
        }
        if(scrollTop > quizTop) {
            $('html, body').animate({
                scrollTop: quizTop
            }, 0);
        }
        
	    self.auto_proceed = $('#quickstart-autoproceed').is(':checked');
	    self.max_questions = Number($('#quickstart-max-questions').val());
	    self.enable_hotkeys = $('#quickstart-hotkeys').is(':checked');
	    if($('#quickstart-fixed-root').is(':checked')) { $('#fixed-root-toggle').removeClass("down"); }
        
	    if(self.enable_hotkeys) {
	        $(document).unbind('keypress');
	        $('.hotkey-text').each(function() {
		        var text = $(this);
                var hotkey = $(this).parent().attr('hotkey');
		        $(document).bind('keypress.control', hotkey, function(e) {
                    //console.log("hotkey",e.key,"control pressed");
		            if(text.parent().is(':visible')) {
			            text.parent().click();
		            }
                    if(hotkey=="space") e.preventDefault();
		        });
	        });
	        $('.hotkey-text').show();
	    } else {
	        $('.hotkey-text').hide();
	    }
        
	    self.setOptions();
    };
    
    $('#start-quiz').fastClick(self.onStartQuiz);
    
    self.onStartAgain = function() {
	    $("#finished-row").hide();
	    $("#hear-individual").hide();
	    $("#quickstart-row").show();
	    $('#total-reps').html(0);
	    $('#correct-reps').html(0);
	    $('#quiz-messages').empty();
	    $('#hear-again').hide();
	    $('#choices-header').css('visibility', 'hidden');
	    $('#answer-choices').css('visibility', 'hidden');
	    $('#stats-table-body').empty();
	    self.incorrect_answers={};
	    self.correct_answers={};
    };
    $('#start-again').fastClick(self.onStartAgain);
    
    $('#end-quiz').fastClick(function() {
        $("#progress-bar").attr("aria-valuenow",0).css({width: "0%"});
	    self.finishQuiz();
    });
    
    $("#level-up-info").popover();


    $(document).keydown(function(e) {
        var HOTKEYS = "1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
        var c = String.fromCharCode(e.which).toUpperCase();
        console.log(c);
        if(self.enable_hotkeys) {
            if(HOTKEYS.includes(c)) {
                $("#answer-btn-"+c+":visible").not(".disabled").click();
            } else if(c===" ") {
                e.preventDefault();
                $('.btn[hotkey="space"]').click();
            }
        }
    });
};

$(document).ready(function() {
    $(".btn").click(function() {
	MIDI.WebAudio.getContext().resume();
    });
});
