/*	ChillTip - Version 1.3.0 - jQuery PlugIn 
	by Christopher Hill - http://www.chillwebdesigns.co.uk/
	Last Modification: 01.11.2011
	
	Licensed under the Creative Commons Attribution 3.0 Unported License - http://creativecommons.org/licenses/by/3.0/
	- Free for use in both personal and commercial projects
	- Attribution requires leaving author name, author link, and the license info intact 
	- ChillBox has been tested with jQuery versions 1.4.3 to 1.6.4.
	- For more information, visit: http://www.chillwebdesigns.co.uk/chilltip.html
	
	This version of ChillTip includes the debouncing function by John Hann & Paul Irish: - http://paulirish.com/2009/throttled-smartresize-jquery-event-handler/
*/

(function($){	

		// ChillTip Function
		$.fn.ChillTip = function(options){
			
			var defaults = { 
			
				// Settings for modification.				
				CTBK: '#000000', // Background colour using (hex colour codes)		
				CTBC: '#333333', // Border colour using (hex colour codes)
				CTTC: '#FFFFFF', // Normal text colour using (hex colour codes)		
				C1 	: '#1E90FF', // Text colour 1 using (hex colour codes)
				C2  : '#FF00CC', // Text colour 2 using (hex colour codes)
				C3  : '#33CC00', // Text colour 3 using (hex colour codes)
				C4  : '#9900FF', // Text colour 4 using (hex colour codes)
				C5  : '#FF0000', // Text colour 5 using (hex colour codes)
				C6  : '#FFFF00', // Text colour 6 using (hex colour codes)
				CTTF: 'Arial, Helvetica, sans-serif', // Font family
				CTC	: 'pointer', // Cursor type, options are pointer, default and help.
				CTFT:       250, // ChillTip fade in time in (milliseconds))
				CTW	:     '250', // ChillTip max width in (px)
				CTTP:      '10', // Text padding in (px)
				CTTS:      '11', // Text size in (px)
				CTBW:    	'2', // Border width in (px)
				CTTO:        20, // top offset in (px)
				CTLO:        20, // Left offset in (px)
				SHAD:	 'true'	 // Show shadow true / false
				
			}; 
			
			var opts = $.extend(defaults, options),			
			
			// Set title variable.			
			title;	
			
			// On hover of class ChillTip run the function.
			this.hover(function(e){
					
				// Get the value of the current title.
				title = $(this).attr('title');
					
				// If class=ChillTip title check, if not empty or undefinded then run ChillTip
				if($(this).attr('title') != '' && $(this).attr('title') != 'undefined'){
									
					// Clear title to prevent default browser tooltip showing.
					this.title = ''; 
					
					// Append ChillTip container to body.
					$('<div id="ct"><p>' + title + '</p></div>').appendTo('body');
					
					// ChillTip Styles.								  
					$('#ct').css({	background:opts.CTBK, 
									border:opts.CTBW + 'px solid', 
									borderColor:opts.CTBC,					
									display:'none', 
									fontFamily:opts.CTTF, 
									height:'auto', 
									top:e.clientY+$(window).scrollTop()+20,
									left:e.clientX+20,
									minWidth:'10px', 
									maxWidth:opts.CTW + 'px', 
									position:'absolute', 
									width:'auto', 
									Zindex:'1001'
									});	
					
					// Get ChillTip width.
					var ctw = $('#ct').width();
					
					// CT paragraph styles.
					$('#ct p').css({color:opts.CTTC, 
									"float":'left',		// Float is reserved by the javascript library so add quotes around for correct use for css.
									display:'none',
									position:'relative',
									background:opts.CTBK,
									fontSize:opts.CTTS + 'px',
									margin:'0', 
									padding:opts.CTTP + 'px', 
									textAlign:'justify',
									width:'auto'
									});			
					
					// IE6 or below and ChillTip width is larger than the option width, then set the MaxWidth. 
					if(($.browser.msie && $.browser.version <= 6) && (ctw > opts.CTW)){$('#ct p').css({width:opts.CTW});}
					
					// If enable shadow is true, show shadow.
					if(opts.SHAD == 'true'){
					
						// ChillTip shadow styles.								  
						$('#ct').css({
								WebkitBoxShadow:'0 0 1em hsla(0, 0%, 0%, 1.0)', // Safari
								MozBoxShadow:'0 0 1em hsla(0, 0%, 0%, 1.0)',	// FireFox
								boxShadow:'0 0 1em hsla(0, 0%, 0%, 1.0)'		// Google & Opera/*
								});	
					
						// & for Internet explorer
						if($.browser.msie ){
							
							$('#ct p').css({margin:'7px 0 0 7px',border:opts.CTBW + 'px solid', borderColor:opts.CTBC});
							$('#ct').css({filter:'progid:DXImageTransform.Microsoft.Blur(PixelRadius="3", MakeShadow="true", ShadowOpacity="0.25")'});	
						}
					}
						// Span colour options.
						$('#ct p span.one').css({color:opts.C1}); 
						$('#ct p span.two').css({color:opts.C2}); 
						$('#ct p span.three').css({color:opts.C3});
						$('#ct p span.four').css({color:opts.C4}); 
						$('#ct p span.five').css({color:opts.C5}); 
						$('#ct p span.six').css({color:opts.C6});	
		
			// On mouse move update ChillTip position to stay in the browser window.		
			$(this).mousemove(function(e){
									   
			var mousex 		= e.pageX + opts.CTLO, 	 // Get X coodrinates.
       			mousey 		= e.pageY + opts.CTTO, 	 // Get Y coordinates.
				tipWidth 	= $('#ct').width(),  // Find width of tooltip.
        		tipHeight 	= $('#ct').height(); // Find height of tooltip.
		
		run();		

		$(window).smartresize(function(){run()});
		
				function run(){			

					// Distance of element from the right edge of viewport.
					var tipVisX = $(window).width() - (mousex + tipWidth+ $(window).scrollLeft());
					
					// Distance of element from the bottom of viewport.
					var tipVisY = ($(window).height() + $(window).scrollTop()) - (mousey + tipHeight);
					
					// If tooltip exceeds the X coordinate of viewport.
					if (tipVisX < opts.CTLO){mousex = e.pageX - tipWidth - opts.CTLO} 
					
					// If tooltip exceeds the Y coordinate of viewport.
					if (tipVisY < opts.CTTO){mousey = e.pageY - tipHeight - opts.CTTO}		
					
					$('#ct').css({top:mousey, left:mousex});	
					
					}
			});
					// Fade in ChillTip.						
					$('#ct,#ct p').fadeIn(opts.CTFT);
					
					// Remove filter to restor cleartype to text.
					$('#ct p').removeAttr('filter');

				
			},		
			// On mouse out, remove ChillTip form body and restore title to its original value.
			function(){this.title = title;$('#ct').remove();
		};	
			}).css({cursor:opts.CTC});	
		
// Returns the jQuery object to allow for chainability.
return this;
}			

})(jQuery);

// Debouncing function by John Hann & Paul Irish to prevent jittering on scroll.
(function ($, sr) {		 
	  
		  var debounce = function (func, threshold, execAsap) {
			  var timeout;
		 
			  return function debounced () {
				  var obj = this, args = arguments;
				  function delayed () {
					  if (!execAsap){
						  func.apply(obj, args);
					  timeout = null;}
				  }
		 
				  if (timeout){
					  clearTimeout(timeout);}
				  else if (execAsap){
					  func.apply(obj, args);
		 
				  timeout = setTimeout(delayed, threshold || 100);} 
			  };
		  };
		  
		// Modified for scroll rather than resize.	
		jQuery.fn[sr] = function(fn){  return fn ? this.bind('scroll', debounce(fn) ) : this.trigger(sr);};})(jQuery,'smartresize');