jQuery(function($) {

    $.ajaxSetup ({
        cache: false
    });

    courseListCheckboxHandler = function(){
        var clicked = this;
        // Check if the user is logged in
        $.ajax({
            url: "/ajax/isLoggedIn",
            cache: true
        })
            .done(function(result){
                var loggedInResult = $.parseJSON(result);
                if(loggedInResult.loggedIn) {
                    var name = $(clicked).attr("name");
                    if($(clicked).is(':checked')) {
                        if( $('span[id=' + name + ']').html().trim() == '+' || $('span[id=' + name + ']').html().trim() == '-') {
                            $('span[id=' + name + ']').html('-');
                        } else {
                            $('span[id=' + name + ']').html('<svg class="icon-minus" viewBox="0 0 32 32"><use xlink:href="#icon-minus"></use></svg>');
                        }

                        // uncheck the rest
                        $('input[name=' + name +']:checked').each(function(){
                            $(this).prop('checked',false);
                        });
                        // check this one back
                        $(clicked).prop('checked',true);
                    } else {
                        if( $('span[id=' + name + ']').html().trim() == '+' || $('span[id=' + name + ']').html().trim() == '-') {
                            $('span[id=' + name + ']').html('+');
                        } else {
                            $('span[id=' + name + ']').
                                html('<svg class="icon-plus" viewBox="0 0 32 32"><use xlink:href="#icon-plus"></use></svg>');
                        }

                    }

                    addRemoveCourse($(clicked).val(), $(clicked).data('course-id'),$(clicked).is(':checked'), $(clicked).data('course-name'));
                } else {
                    // redirect to signup page
                    window.location.replace("/signup/cc/" +$(clicked).data('course-id')+ "/"+ $(clicked).val());
                }
            });
    }

    // Handle calls to add/remove courses to users library
    $('input[class="course-list-checkbox"]').change( courseListCheckboxHandler );

    // Completed, Audited, Partially Completed, Drooped
    var listCourseDone = [
        3,4,5,6
    ];

    // Enrolled, Current
    var listEnrolled = [
        2,7
    ];

    function updateCounter( incr )
    {
        var start = parseInt( $('#mycourses-listed-count').text() );
        var end;
        if(incr) {
            end = start + 1;
        } else {
            end = start - 1;
        }

        var numAnim = new countUp("mycourses-listed-count", start, end, 0, 1);
        numAnim.start();
    }

    function addRemoveCourse(listId, courseId, checked,name) {
        try{
            if(checked){
                _gaq.push(['_trackEvent','My Courses - Add',listId.toString(), courseId.toString()]);
            }else {
                _gaq.push(['_trackEvent','My Courses - Remove', listId.toString(),  courseId.toString() ]);
            }
        }catch(err){}
        if(checked){
            $.ajax( "/ajax/user/course/add?c_id=" +courseId +"&l_id="+ listId)
                .done(
                function(result){
                    var r = JSON.parse(result);
                    if(r.success)
                    {
                        if( typeof courseAdded != 'undefined' && !courseAdded) {
                            updateCounter(true);
                            courseAdded = true;
                        }

                        if($.inArray(Number(listId), listCourseDone) >= 0)
                        {
                            // Ask them to review the course
                            notifyWithDelay(
                                'Course added',
                                'Would you like to review it? It takes no time at all ' +
                                    '<br/><a href="/review/new/' + courseId+ '">Review ' + name +
                                    '</a> ',
                                'success',
                                60
                            );
                        }
                        else if($.inArray(Number(listId), listEnrolled) >= 0)
                        {
                            // Ask them to review once they are done with the course
                            notifyWithDelay(
                                'Course added',
                                '<i>'+ name +'</i> added to <a href="/user/courses">My Courses</a> successfully. ' +
                                    'Don\'t forget to <a href="/review/new/' + courseId + '">review</a> the course once you finish it'
                                ,
                                'success',
                                30
                            );
                        }
                        else
                        {
                            // Interested
                            notify(
                                'Course added',
                                '<i>'+ name +'</i> added to <a href="/user/courses">My Courses</a> successfully',
                                'success'
                            );
                        }



                    }
                }
            );
        } else {
            $.ajax( "/ajax/user/course/remove?c_id=" +courseId +"&l_id="+ listId)
                .done(
                function(result){
                    var r = JSON.parse(result);
                    if(r.success)
                    {
                        // Decrement count - Course page
                        if( typeof courseAdded != 'undefined')
                        {
                            updateCounter(false);
                            courseAdded = false;
                        }
                        notify(
                            'Course removed',
                            '<i>'+ name +'</i> removed from <a href="/user/courses">My Courses</a> successfully',
                            'success'
                        );
                    }
                }
            );
        }
    }

    function notify( title, text, type)
    {
        new PNotify({
            title: title,
            text: text,
            type: type,
            animation: 'show'
        });
    }

    function notifyWithDelay( title, text, type, delay)
    {
        new PNotify({
            title: title,
            text: text,
            type: type,
            animation: 'show',
            delay: delay * 1000
        });
    }

    // Select dropdown on course pages
    $('#sessionOptions').change(function() {
        var selected = $(this).find('option:selected');
        var url = selected.data("url");
        var sessionType = selected.data('sessiontype');
        var sessionStatus = selected.data('sessionstatus');
        var sessionStartDate = selected.data('sessionstartdate');

        // Update the user of the href tag
        $('#btnProviderCoursePage').attr("href",url);

        // Update the add to calendar button
        $('._start').html(sessionStartDate);
        $('._end').html(sessionStartDate);
        if(sessionType=='upcoming' && sessionStatus == '1') {
            $('.btnAddToCalendar').show();
        }
        else {
            $('.btnAddToCalendar').hide();
        }

    });


    // relevant to course information page and course tables
    // stop dropdown from closing when its inside elements are clicked on
    $('.course-button-group .dropdown-menu').bind('click', function (e) {
        //e.stopPropagation();
    });

    $('.table .dropdown-menu').bind('click', function (e) {
        //e.stopPropagation();
    });

    /**
     * User preferences - Newsletter
     */
    $('input[class="user-newsletter-checkbox"]').change(function(){
        var clicked = this;
        // Check if the user is logged in
        $.ajax({
            url: "/ajax/isLoggedIn",
            cache: true
        })
            .done(function(result){
                var loggedInResult = $.parseJSON(result);
                if(loggedInResult.loggedIn) {
                    updateSubscription($(clicked).val(), $(clicked).is(':checked'));
                } else {
                    // redirect to loginpage page
                    window.location.replace("/login");
                }
            });
    });

    var updateSubscription = function(code, checked) {
        try{
            if(checked){
                _gaq.push(['_trackEvent','Newsletter Preferences','Subscribed', code]);
            }else {
                _gaq.push(['_trackEvent','Newsletter Preferences','Unsubscribed', code]);
            }
        }catch(err){}

        if(checked){
            $.ajax( "/ajax/newsletter/subscribe/"+code)
                .done(
                function(result){
                    //console.log("jquery" + result);
                }
            );
        } else {
            $.ajax("/ajax/newsletter/unsubscribe/"+code)
                .done(
                function(result){
                    //console.log("jquery" + result);
                }
            );
        }
    }

    /**
     * User Preferences - MOOC Tracker preferences
     */
    $('input[class="mooc-tracker-checkbox"]').change(function(){
        var clicked = this;
        // Check if the user is logged in
        $.ajax({
            url: "/ajax/isLoggedIn",
            cache: true
        })
            .done(function(result){
                var loggedInResult = $.parseJSON(result);
                if(loggedInResult.loggedIn) {
                    updateUserPreference($(clicked).val(), $(clicked).is(':checked'));
                } else {
                    // redirect to loginpage page
                    window.location.replace("/login");
                }
            });
    });

    var updateUserPreference = function(prefId, checked) {
        try{
            if(checked){
                _gaq.push(['_trackEvent','MOOC Tracker Preferences','Checked', prefId]);
            }else {
                _gaq.push(['_trackEvent','MOOC Tracker Preferences','UnChecked', prefId]);
            }
        }catch(err){}
        if(checked){
            $.ajax( "/ajax/user/pref/"+ prefId + "/1")
                .done(
                function(result){
                    // console.log("jquery" + result);
                }
            );
        } else {
            $.ajax("/ajax/user/pref/"+ prefId + "/0")
                .done(
                function(result){
                    //console.log("jquery" + result);
                }
            );
        }
    }

    /**
     * Reviews and ratings
     */
    var isEmpty = function(str) {
        return (!str || 0 === str.length);
    }

    $('#review-text').autosize();

    loadRaty = function() {
        var ratyDefaults = {
            starHalf    : '/bundles/classcentralsite/slashpixel/images/star-half-gray.png',
            starOff     : '/bundles/classcentralsite/slashpixel/images/star-off-gray.png',
            starOn      : '/bundles/classcentralsite/slashpixel/images/star-on-gray.png',
            hints       : ['','','','',''],
            size        : 21,
            score       : function() {
                return $(this).attr('data-score');
            }
        };

        $('#rating').raty(ratyDefaults);

        $('.course-rating').raty($.extend(
            {
                readOnly: true
            },
            ratyDefaults
        ));

        $('.user-rating').raty($.extend(
            {
                readOnly: true
            },
            ratyDefaults
        ));
    }

    loadRaty();

    /**
     * Review course
     */
    $('#submit-review').click(function(event){
        event.preventDefault();
        $('#submit-review').attr('disabled',true);

        var review = getReviewFormFields();
        var validationError = validateReviewForm(review);

        if(!validationError) {
            try{
                if(review.reviewId === undefined){
                    _gaq.push(['_trackEvent', 'Create Review', " " + $('#courseId').data("value")]);
                } else {
                    _gaq.push(['_trackEvent', 'Update Review'," " +  $('#courseId').data("value")]);
                }
            } catch(err){}

            $.ajax({
                type:"post",
                url:"/user/review/create/" + $('#courseId').data("value"),
                data:JSON.stringify(review)
            })
                .done(
                function(result){
                    result = JSON.parse(result);
                    if(result['success']) {
                        // Redirect to the course page
                        window.location.href = $('#courseUrl').data("value");
                    } else {
                        // Show an error message
                    }
                }
            );

        } else {
            $('#submit-review').attr('disabled',false);

        }

    });

    $('#submit-signup-review').click(function(event){
        event.preventDefault();
        $('#submit-signup-review').attr('disabled', true);

        var review = getReviewFormFields();
        var validationError = validateReviewForm(review);

        if(!validationError) {
            $('#signupForm').on('hidden.bs.modal',function(e){
                location.reload();
            });
            $.ajax({
                type:"post",
                url:"/review/save/" + $('#courseId').data("value"),
                data:JSON.stringify(review)
            })
                .done(
                function(result){
                    result = JSON.parse(result);
                    if(result['success']) {
                        // Clear the form
                        var rating = $('#rating').raty('score');
                        $('textarea[name=review-text]').val("");
                        $('input:radio[name=progress]:checked').prop('checked',false);

                        // Redirect to the course page
                        $('#signupForm').modal('show');
                    } else {
                        // Show an error message
                        showPinesNotification('error','Some error occurred',result['message']);
                    }
                }
            );

        }

    });



    var getReviewFormFields = function() {
        // Get all the fields
        var rating = $('#rating').raty('score');
        var reviewText = $('textarea[name=review-text]').val();
        var effort = $('input:text[name=effort]').val();
        var progress = $('input:radio[name=progress]:checked').val();
        var difficulty = $('input:radio[name=difficulty]:checked').val();
        var level = $('input:radio[name=level]:checked').val();
        var offeringId = $('#sessionOptions').val();
        var status = $('#reviewStatus').val();
        var reviewId = $('#reviewid').data("value");
        var externalReviewerName = $('#ext-reviewer-name').val();
        var externalReviewLink = $('#ext-review-link').val();

        var review = {
            'rating': rating,
            'reviewText': reviewText,
            'effort': effort,
            'progress': progress,
            'difficulty': difficulty,
            'level':level,
            'offeringId':offeringId,
            'status':status,
            'reviewId':reviewId,
            'externalReviewerName': externalReviewerName,
            'externalReviewLink': externalReviewLink
        };

        return review;
    }

    var validateReviewForm = function(review) {
        // Validate the form
        var validationError = false;

        // Rating cannot be empty
        if(review.rating === undefined) {
            $('#rating-error').show();
            validationError = true;
        } else {
            $('#rating-error').hide();
        }

        // progress cannot be empty
        if(review.progress === undefined) {
            $('#progress-error').show();
            validationError = true;
        } else {
            $('#progress-error').hide();
        }

        // Review if exits should be atleast 20 words long
        if(!isEmpty(review.reviewText)) {
            // Non empty review. Should be 20 words long
            var words = review.reviewText.split(' ');
            if(words.length < 20) {
                $('#review-text-error').show();
                validationError = true;
            } else {
                $('#review-text-error').hide();
            }
        } else {
            $('#review-text-error').hide();
        }

        return validationError;
    }



    // Review feedback
    $('.review-feedback').bind('click',function(e){
        e.preventDefault();

        var helpful = $(this).text();
        var reviewId = $(this).data('reviewid');
        var feedback = (helpful === 'NO') ? 0 : 1;

        $.ajax("/ajax/review/feedback/"+ reviewId+"/"+feedback)
            .done(function(result){
                $('#review-feedback-'+reviewId).text("Thank you for your feedback.");
            });

    });

    // Default notification false
    //$.pnotify.defaults.history = false;

    var showPinesNotification = function(type,title,text){
        new PNotify({
            title: title,
            text: text,
            type: type,
            animation: 'show'
        });
    }

    // Pines notification
    $('.flash-message').each(function(index,element){

        new PNotify({
            title: $(element).data('title'),
            text: $(element).text(),
            type: $(element).data('type'),
            animation: 'show',
            delay: $(element).data('delay') * 1000
        });
    });


    $('.faq-box .question').click( function() {
        var parent = $(this).parent();
        if (parent.hasClass('show-answer') ) {
            parent.find('.answer').hide();
            parent.toggleClass('show-answer');
        } else {
            parent.find('.answer').show();
            parent.toggleClass('show-answer');
        }
    });

    $('.faq-wrap .faq-question').click( function() {
        var parent = $(this).parent();
        if (parent.hasClass('show-answer') ) {
            parent.find('.faq-answer').hide();
            parent.toggleClass('show-answer');
        } else {
            parent.find('.faq-answer').show();
            parent.toggleClass('show-answer');
        }
    });

    // front page tab nav
    $(".section-tab-content").css("height", "0");
    defaultTab = $(".active-tab > a").data("target-section");
    $("." + defaultTab).css("height", "auto");
    $('nav.page-tabs').on('click', 'ul > li > a', function(event) {
        event.preventDefault();
        $this = $(this);
        targetTab = $this.data("target-section");
        if (targetTab !== undefined) {
            $(".section-tab-content").css("height", "0");
            $("." + targetTab).css("height", "auto");
            $("nav.page-tabs ul > li").removeClass("active-tab");
            $this.closest("li").addClass("active-tab");
            $.scrollTo('.page-tabs',{ duration: 400 });
        }
        else {
            targetTab = 'create-free-account'; // signup button
        }
        try {
            _gaq.push(['_trackEvent','Homepage Tab clicks',targetTab]);
        } catch (e) {
            console.log("error");
        }
    });

    $('.course-data-row .dropdown-menu input').click(function(e) {
        e.stopPropagation();
    });

    $('.course-data-row .dropdown-menu label').click(function(e) {
        e.stopPropagation();
    });

    // expand single reviews
    $('.expand-preview').on('click', function(e) {
        e.preventDefault();
        $this = $(this);
        $this.parent().hide();
        $this.closest(".review-content").find(".review-full").show();
        $this.hide();
    });


    /*
     Search functionality
     */
    var customRenderFunction = function(document_type, item) {
        var title = '<p class="title">' + item['name'] + '</p>';
        if(document_type == 'courses') {
            var ins = '';
            if(typeof item['institutions'] !== 'undefined' && item['institutions'] != '' ) {
                ins = item['institutions'][0] + ' - ';
            }
            var provider = '';
            if(typeof item['provider'] !== 'undefined' && item['provider'] != '' ) {
                provider = ' | ' + item['provider'];
            }

            return title.concat('<p>' + ins + item['displayDate'] + provider + '</p>');
        } else if (document_type == 'universities' || document_type == 'subjects') {
            return title.concat('<p class="genre">' + item['courseCount'] + ' courses </p>');
        }
    };

    // Navbar search button
    $('#navbar-search-btn').click(function(e){
        e.preventDefault();
        $('#navbar-search-form').submit();
    });


    $('#home-create-free-account').click( function(e){
        e.preventDefault();
        $('#signupForm').modal('show');
        try {
            _gaq.push(['_trackEvent','Create Free Account','Home Tab']);
        }catch (e){}
    });

    $('#convincer-create-free-account').click( function(e){
        e.preventDefault();
        $('#signupForm').modal('show');
        try {
            _gaq.push(['_trackEvent','Create Free Account','Convincer']);
        }catch (e){}
    });

    // Typeahead

    $('#navbar-search-form #st-search-input').on("keydown.cc", function (e) {
        $this = $(this);
        if (e.which == 13) {

            if ($('#navbar-search-form .tt-suggestion.tt-cursor a').attr('href') !== undefined && $('#navbar-search-form .tt-suggestion.tt-cursor .search-view-all').length === 0) {
                var dataType = $('#navbar-search-form .tt-suggestion.tt-cursor a').data("type");
                var dataName = $('#navbar-search-form .tt-suggestion.tt-cursor a').data("name");
                window.location = $('#navbar-search-form .tt-suggestion.tt-cursor a').attr('href');
                try {
                    _gaq.push(['_trackEvent', 'Search Autocomplete' , dataType, dataName ]);
                }catch (e){}
            } else if ($('#navbar-search-form .tt-suggestion.tt-cursor .search-view-all').length ) {
                $('#navbar-search-form').submit();
                return false;
            } else if ( $this.is(":focus") ) {
                $('#navbar-search-form').submit();
            }
        }
    });

    var ccSearch = new Bloodhound({
        datumTokenizer: function (datum) {
            return Bloodhound.tokenizers.whitespace(datum.value);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 11,
        remote: {
            url: '/autocomplete/%QUERY',
            filter: function (data) {



                if (data.autocomplete[0].options.length > 0) {
                    var footerItem = {payload:{type:'footer-template', name: ''}};
                    var autoOptions = data.autocomplete[0].options;
                    var footerInArray = false;

                    $.each(autoOptions, function(key, value) {
                        if (value.payload.type === "footer-template") {
                            footerInArray = true;
                        }
                    });

                    if (footerInArray === false) {
                        autoOptions.push(footerItem)
                    }
                }

                return $.map(data.autocomplete[0].options, function (option) {
                    return {
                        payload: option.payload,
                        name: option.payload.name
                    };
                });

            }
        }
    });

    ccSearch.initialize();

    $('#navbar-search-form .cc-search-box')
        .typeahead(null, {
            name: '',
            displayKey: 'name',
            source: ccSearch.ttAdapter(),
            templates: {
                empty: [],
                suggestion: function (data) {
                    var templateScript;

                    if (data.payload.type === "course") {
                        templateScript = $("#course-template").html();
                    } else if (data.payload.type === "subject") {
                        templateScript = $("#subject-template").html();
                    } else if (data.payload.type === "provider") {
                        templateScript = $("#provider-template").html();
                    } else if (data.payload.type === "institution") {
                        templateScript = $("#uni-template").html();
                    } else if (data.payload.type === "footer-template") {
                        templateScript = $("#footer-template").html();
                    } else {
                        templateScript = $("#base-template").html();
                    }

                    var suggestionTemplate = Handlebars.compile(templateScript);
                    return suggestionTemplate(data);
                }
            }
        })
        .on('typeahead:closed', function() {
            $('body.tt-is-open').removeClass('tt-is-open');
        }
    );

    $('#navbar-search-form .tt-dropdown-menu').on('click', '.search-view-all', function(e) {
        e.preventDefault();
        $('#navbar-search-form #st-search-input').val($('#navbar-search-form #st-search-input').typeahead('val'));
        $('#navbar-search-form').submit();
        return false;
    });


    $('#navbar-search-form .tt-dropdown-menu').bind("DOMSubtreeModified", function() {
        if  ($('#navbar-search-form .tt-dropdown-menu .tt-suggestion').length) {
            $('body').addClass('tt-is-open');
        } else {
            $('body.tt-is-open').removeClass('tt-is-open');
        }
    });

    $('#navbar-search-form #st-search-input').on("keydown.cc", function (e) {
        $this = $(this);
        if (e.which == 38 || e.which == 40 ) {
            if ($('#navbar-search-form .tt-suggestion.tt-cursor .suggestions-footer').length) {
                $this.val($this.typeahead('val'));
            }
        }
    });

    // classbot search form
    $('#classbot-search-input').on("keydown.cc", function (e) {
        $this = $(this);
        if (e.which == 13) {

            if ($('#classbot-search-container .tt-suggestion.tt-cursor a').attr('href') !== undefined && $('#classbot-search-container .tt-suggestion.tt-cursor .search-view-all').length === 0) {
                var dataType = $('#classbot-search-container .tt-suggestion.tt-cursor a').data("type");
                var dataName = $('#classbot-search-container .tt-suggestion.tt-cursor a').data("name");

                window.location = $('#classbot-search-container .tt-suggestion.tt-cursor a').attr('href');

                try {
                    _gaq.push(['_trackEvent', 'Search Autocomplete' , dataType, dataName ]);
                }catch (e){}
            } else if ($('#classbot-search-container .tt-suggestion.tt-cursor .search-view-all').length ) {
                $('#classbot-search-container form').submit();
                return false;
            } else if ( $this.is(":focus") ) {
                $('#classbot-search-container form').submit();
            }
        }
    });

    $('#classbot-search-input')
        .typeahead(null, {
            name: '',
            displayKey: 'name',
            source: ccSearch.ttAdapter(),
            templates: {
                empty: [],
                suggestion: function (data) {
                    var templateScript;

                    if (data.payload.type === "course") {
                        templateScript = $("#course-template").html();
                    } else if (data.payload.type === "subject") {
                        templateScript = $("#subject-template").html();
                    } else if (data.payload.type === "provider") {
                        templateScript = $("#provider-template").html();
                    } else if (data.payload.type === "institution") {
                        templateScript = $("#uni-template").html();
                    } else if (data.payload.type === "footer-template") {
                        templateScript = $("#footer-template").html();
                    } else {
                        templateScript = $("#base-template").html();
                    }

                    var suggestionTemplate = Handlebars.compile(templateScript);
                    return suggestionTemplate(data);
                }
            }
        });

    $('#classbot-search-container .tt-dropdown-menu').addClass("js-no-custom-scrollbar");

    $('#classbot-search-container .tt-dropdown-menu').on('click', '.search-view-all', function(e) {
        e.preventDefault();
        $('#classbot-search-input').val($('#classbot-search-input').typeahead('val'));
        $('#classbot-search-container form').submit();
        return false;
    });


    //classbot scrollbar
    /*
     var $classbotScrollbar = $("#classbot-search-container .tt-dropdown-menu");
     $classbotScrollbar.removeClass("js-no-custom-scrollbar").addClass("js-custom-scrollbar");
     $("#classbot-search-container .tt-dropdown-menu > div").wrapAll('<div class="overview" />');
     $("#classbot-search-container .tt-dropdown-menu .overview").wrapAll('<div class="viewport" />');
     $classbotScrollbar.prepend('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>');
     console.log($classbotScrollbar);
     $classbotScrollbar.tinyscrollbar();

     var classbotScrollbar = $classbotScrollbar.data("plugin_tinyscrollbar");
     classbotScrollbar.update();


     var scrollHeight;
     var realHeight;

     $('#classbot-search-container .tt-dropdown-menu .overview').bind("DOMSubtreeModified", function() {

     setTimeout(function() {

     scrollHeight = $("#classbot-search-container .tt-dropdown-menu .overview .tt-suggestion:first-child").height() * 7;
     realHeight = $("#classbot-search-container .tt-dropdown-menu .overview .tt-suggestions").height();

     console.log(scrollHeight);
     if  (scrollHeight < realHeight) {
     $("#classbot-search-container .tt-dropdown-menu .viewport").height(scrollHeight);
     } else {
     $("#classbot-search-container .tt-dropdown-menu .viewport").height(realHeight);
     }

     console.log("update");
     classbotScrollbar.update();
     }, 500);
     });

     */

    $('#classbot-search-input').on("keydown.cc", function (e) {
        $this = $(this);
        if (e.which == 38 || e.which == 40 ) {
            if ($('#classbot-search-container .tt-suggestion.tt-cursor .suggestions-footer').length) {
                $this.val($this.typeahead('val'));
            }
        }
    });

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    var lazyClassbotToggle = debounce(function() {
        $('#classbot').modal('toggle');
    }, 150);

    $(document).bind('keydown', function(e) {
        if(e.ctrlKey && (e.which == 76)) {
            e.preventDefault();
            if (Modernizr.touch) {
                $( "#navbar-search-form #st-search-input" ).focus();
                return false;
            } else {
                lazyClassbotToggle();
                return false;
            }
        }
    });


    //general search form typeahead
    $('#general-search #st-search-input').on("keydown.cc", function (e) {
        $this = $(this);
        if (e.which == 13) {

            if ($('#general-search .tt-suggestion.tt-cursor a').attr('href') !== undefined && $('#general-search .tt-suggestion.tt-cursor .search-view-all').length === 0) {
                var dataType = $('#general-search .tt-suggestion.tt-cursor a').data("type");
                var dataName = $('#general-search .tt-suggestion.tt-cursor a').data("name");

                window.location = $('#general-search .tt-suggestion.tt-cursor a').attr('href');

                try {
                    _gaq.push(['_trackEvent', 'Search Autocomplete' , dataType, dataName ]);
                }catch (e){}
            } else if ($('#general-search .tt-suggestion.tt-cursor .search-view-all').length ) {
                $('#general-search form').submit();
                return false;
            } else if ( $this.is(":focus") ) {
                $('#general-search form').submit();
            }
        }
    });

    $('#general-search .cc-search-box')
        .typeahead(null, {
            name: '',
            displayKey: 'name',
            source: ccSearch.ttAdapter(),
            templates: {
                empty: [],
                suggestion: function (data) {
                    var templateScript;

                    if (data.payload.type === "course") {
                        templateScript = $("#course-template").html();
                    } else if (data.payload.type === "subject") {
                        templateScript = $("#subject-template").html();
                    } else if (data.payload.type === "provider") {
                        templateScript = $("#provider-template").html();
                    } else if (data.payload.type === "institution") {
                        templateScript = $("#uni-template").html();
                    } else if (data.payload.type === "footer-template") {
                        templateScript = $("#footer-template").html();
                    } else {
                        templateScript = $("#base-template").html();
                    }

                    var suggestionTemplate = Handlebars.compile(templateScript);
                    return suggestionTemplate(data);
                }
            }
        })
        .on('typeahead:closed', function() {
            $('body.tt-is-open').removeClass('tt-is-open');
        }
    );

    $('#general-search .tt-dropdown-menu').on('click', '.search-view-all', function(e) {
        e.preventDefault();
        $('#general-search #st-search-input').val($('#general-search #st-search-input').typeahead('val'));
        $('#general-search form').submit();
        return false;
    });


    $('#general-search .tt-dropdown-menu').bind("DOMSubtreeModified", function() {
        if  ($('#general-search .tt-dropdown-menu .tt-suggestion').length) {
            $('body').addClass('general-drop-is-open');
        } else {
            $('body.general-drop-is-open').removeClass('general-drop-is-open');
        }
    });

    $('#general-search #st-search-input').on("keydown.cc", function (e) {
        $this = $(this);
        if (e.which == 38 || e.which == 40 ) {
            if ($('#general-search .tt-suggestion.tt-cursor .suggestions-footer').length) {
                $this.val($this.typeahead('val'));
            }
        }
    });

    //Classbot
    $('#classbot').on('show.bs.modal', function (e) {
        $("body").addClass("classbot-open");
    });

    $('#classbot').on('shown.bs.modal', function (e) {
        $("#classbot-search-input").focus();
    });

    $('#classbot').on('hidden.bs.modal', function (e) {
        $("body").removeClass("classbot-open");
        $("#classbot-search-input").blur();
    });





    //html5 video play button
    function vidplay() {
        var video;
        $(".js-video-play").on("click", function(e) {
            $this = $(this);
            video = $this.closest(".html5-video-container").find("video").get(0);
            if (video.paused) {
                video.play();
                $this.fadeTo(300, 0);
            } else {
                video.pause();
                $this.fadeTo(300, 1);
            }

        });
    }

    vidplay();

});