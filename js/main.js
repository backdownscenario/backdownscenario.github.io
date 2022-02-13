$(document).ready(function(){
	"use strict";

	var window_width 	 = $(window).width(),
	window_height 		 = window.innerHeight,
	header_height 		 = $(".default-header").height(),
	fitscreen 			 = window_height - header_height;

	$(".fullscreen").css("height", window_height * 0.66)
 });
