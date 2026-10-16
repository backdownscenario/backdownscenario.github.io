(function () {
	"use strict";

	// Header gets a background once the page is scrolled
	var header = document.querySelector(".site-header");
	function onScroll() {
		header.classList.toggle("scrolled", window.scrollY > 40);
	}
	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	// Hero video: only load it when motion is welcome and data is not scarce
	var video = document.querySelector("[data-hero-video]");
	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	var saveData = navigator.connection && navigator.connection.saveData;
	if (video && !reduceMotion && !saveData) {
		video.querySelectorAll("source[data-src]").forEach(function (source) {
			source.src = source.dataset.src;
		});
		video.load();
		var play = video.play();
		if (play && play.catch) {
			play.catch(function () { /* autoplay blocked: poster stays */ });
		}
	}

	// Spotify players load only after an explicit click (no third-party requests before that)
	var CONSENT_KEY = "bds-spotify-ok";
	var template = document.getElementById("player-consent");

	function hasConsent() {
		try {
			return sessionStorage.getItem(CONSENT_KEY) === "1";
		} catch (e) {
			return false;
		}
	}

	function loadPlayer(el) {
		var iframe = document.createElement("iframe");
		iframe.src = "https://open.spotify.com/embed/album/" + el.dataset.spotify + "?theme=0";
		iframe.height = el.dataset.height || "352";
		iframe.loading = "lazy";
		iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
		iframe.title = "Spotify player";
		el.replaceChildren(iframe);
	}

	function reservePlayer(el) {
		el.style.height = (el.dataset.height || "352") + "px";
	}

	function preparePlayer(el) {
		reservePlayer(el);
		if (el.querySelector("iframe")) {
			return;
		}
		if (hasConsent()) {
			loadPlayer(el);
			return;
		}
		el.replaceChildren(template.content.cloneNode(true));
		el.querySelector("[data-load-player]").addEventListener("click", function () {
			try {
				sessionStorage.setItem(CONSENT_KEY, "1");
			} catch (e) { /* ignore */ }
			loadPlayer(el);
		});
	}

	document.querySelectorAll("#stage .player").forEach(preparePlayer);

	// Release stage: each cover in the row puts its release on the stage.
	// The stage is as tall as its content; when that changes, the scroll position is
	// corrected by the same amount, so the row of covers never moves under the pointer.
	var stage = document.getElementById("stage");
	var stageCover = stage.querySelector(".release-cover img");
	var stageInfo = stage.querySelector(".release-info");
	var latestNodes = Array.from(stageInfo.childNodes);
	var releaseRow = document.querySelector(".release-grid");
	var cards = Array.from(document.querySelectorAll(".release-card"));
	var switchTimer = null;

	function detailNodes(article) {
		if (article.hasAttribute("data-latest")) {
			return latestNodes;
		}
		return Array.from(article.querySelector(".release-detail").cloneNode(true).childNodes);
	}

	function showRelease(article) {
		var card = article.querySelector(".release-card");
		history.replaceState(null, "", "#" + article.id);
		if (card.getAttribute("aria-pressed") === "true" && stage.dataset.release === article.id) {
			return;
		}
		cards.forEach(function (c) {
			c.setAttribute("aria-pressed", c === card ? "true" : "false");
		});
		stage.dataset.release = article.id;
		clearTimeout(switchTimer);
		stage.classList.add("is-switching");
		switchTimer = setTimeout(function () {
			var rowTop = releaseRow.getBoundingClientRect().top;
			stageCover.src = card.querySelector("img").src;
			stageCover.alt = "Cover of " + card.querySelector(".release-name").textContent;
			stageInfo.replaceChildren.apply(stageInfo, detailNodes(article));
			preparePlayer(stageInfo.querySelector(".player"));
			var shift = releaseRow.getBoundingClientRect().top - rowTop;
			if (shift) {
				window.scrollBy({ top: shift, behavior: "instant" });
			}
			stage.classList.remove("is-switching");
		}, reduceMotion ? 0 : 220);
	}

	stage.dataset.release = "echoes-of-reverie";
	cards.forEach(function (card) {
		card.addEventListener("click", function () {
			showRelease(card.closest(".release"));
		});
	});

	document.querySelectorAll("[data-show-latest]").forEach(function (link) {
		link.addEventListener("click", function () {
			showRelease(document.querySelector(".release[data-latest]"));
		});
	});

	// Deep link to a release shows it on the stage
	var target = location.hash && document.getElementById(location.hash.slice(1));
	if (target && target.matches(".release-grid .release")) {
		showRelease(target);
	}
})();
