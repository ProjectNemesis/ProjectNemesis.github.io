console.clear();

var _doc = document,
	_window = window;

// Only perform the code when the document is fully loaded
_doc.addEventListener('DOMContentLoaded', function() {
	loadHeaderEffects();
	scrollToView();
	loadMessages();
});

function scrollToView() {
	var main = document.getElementById('main-about-container'),
		headerScrollDown = _doc.getElementById('headerScrollDown');
	
	headerScrollDown.addEventListener('click', scroll);
	function scroll() {
		scrollTo(main, 600);
	}
}

function loadMessages() {
	var phoneContainer = _doc.getElementById('phone-container'),
		phoneMessages = _doc.getElementById('phone-messages'),
		phoneScroll = _doc.getElementById('phone-messages-scroll'),
		// We need a static snapshot of `about-wrapper`, because we will remove
		// the elements, and we need a reference to them. We are therefore converting
		// the live HTMLCollection to an array.
		// Difference in performance between `getElementsByClassName` vs
		// `querySelectorAll`, see http://bit.do/Performance
		about = Array.prototype.slice.call(_doc.getElementsByClassName('about')),
		// Cannot access index by phoneMessages.children.length,
		// because `phoneMessages` will sometimes have `loadingMsgElem`.
		// Doesn't make sense to get `about-wrapper` by className,
		// because all we'll be accessing is its length, performance-wise
		// it's more efficent to make a variable. See http://bit.do/Performance
		aboutIndexToDisplay = 0;
	
	
	
	for (var i = 0; i < about.length; i++) {
		// Remove messages so that we can populate it with animation.
		phoneMessages.removeChild(about[i]);
	}
	
	// Initialize SimSmoothScroller for messages
	var scroller = new SimSmoothScroller(phoneMessages);

	// Don't show message until its container is in view
	_window.addEventListener('scroll', callbackFunc);
	function callbackFunc() {
		var phoneContainerRect = phoneContainer.getBoundingClientRect(),
			showOnPos = phoneContainerRect.top + phoneContainer.offsetHeight; // Only show when the full contianer is in view
		if (showOnPos <= _doc.documentElement.clientHeight) {
			addMessage(800);
			// Remove scroll event, because it's not needed anymore
			_window.removeEventListener('scroll', callbackFunc);
		}
	}
	

	function addMessage(timeToAppear) {
		// Create local variables
		var currentMsg = about[aboutIndexToDisplay],
			// Create loadMsgElem(left || right)
			loadingMsgElem = createLoadingMsg(about[aboutIndexToDisplay].classList.contains('left'));
		// Apply default argument if needed
		if (typeof timeToAppear !== 'number') timeToAppear = 1000 + (Math.random() * 20) * 100;

		// Add Event
		loadingMsgElem.addEventListener('animationend', loadingMsgAnimCallback);
		
		setTimeout(function() {
			var scrollPos = loadingMsgElem.offsetTop + loadingMsgElem.offsetHeight + 10;
			
			// Add loadingMsgElem, and scroll to position
			phoneMessages.appendChild(loadingMsgElem);
			scroller.reconfigSize(); // Call everytime DOM change in messages
			scroller.scrollToPx(scrollPos, false);
			
			setTimeout(function() {
				// Prep to remove loadingMsgElem
				loadingMsgElem.style.animationDirection = 'reverse';
				loadingMsgElem.classList.add('text-message-animation');
			}, (currentMsg.textContent.length / 50) * 1300); // 50 = Average amount per line (not exact)
		}, timeToAppear);
	}

	function loadingMsgAnimCallback(e) {
		if (e.animationName !== 'text-message-bounce') return;

		// Create local variable
		var loadingMsg = e.target;

		// Check if loadingMsg came or went.
		if (loadingMsg.style.animationDirection !== 'reverse') {
			// Prep for next animation
			loadingMsg.classList.remove('text-message-animation');
		} else if (loadingMsg.style.animationDirection === 'reverse') {
			// Create local variable
			var messageElement = about[aboutIndexToDisplay];
			var scrollPos = 0;

			// Add animationEnd callback for message
			messageElement.addEventListener('animationend', messageAnimCallback)
			
			// Add time stamp to messageInfo
			messageElement.firstElementChild.appendChild(getCurrentTime());
			

			// Configure DOM
			phoneMessages.removeChild(loadingMsg);
			phoneMessages.appendChild(messageElement);
			
			// Scroll to element so that it's in view
			scrollPos = messageElement.offsetTop + messageElement.offsetHeight + 50;
			scroller.reconfigSize(); // Call everytime DOM change in messages
			scroller.scrollToPx(scrollPos, false);
		}
	}

	function messageAnimCallback(e) {
		// Create local variable
		var messageElement = about[aboutIndexToDisplay],
			pauseAmountForMsg = (messageElement.textContent.length / 50) * 1300; // 50 = Average amount per line (not exact);

		// Message doesn't need event... Remove it
		messageElement.removeEventListener('animationend', messageAnimCallback);

		// Prep for future animation (if any)
		messageElement.classList.remove('text-message-animation');

		// 
		aboutIndexToDisplay++;
		if (aboutIndexToDisplay !== about.length) addMessage(pauseAmountForMsg);
		else aboutIndexToDisplay--; // Cancel the increment
	}

	function createLoadingMsg(left) {
		left = (typeof left !== 'undefined' && left) ? ' left' : '';
		var loadingBubbleContainer = _doc.createElement('div');

		for (var i = 0; i < 3; i++) {
			var loadingBubbles = _doc.createElement('div');
			loadingBubbles.className = 'loading-bubble';
			loadingBubbleContainer.appendChild(loadingBubbles);
		}

		loadingBubbleContainer.className = 'about' + left + ' loading-bubble-container';

		return loadingBubbleContainer;
	}

	function getCurrentTime() {
		var currentTime = new Date(new Date().getTime()).toLocaleTimeString(),
			elem;
		
		currentTime = currentTime.slice(0, currentTime.length - 6) + currentTime.slice(currentTime.length - 3);
		elem = _doc.createTextNode(currentTime);
		
		return elem;
	}

}





function loadHeaderEffects() {
	var writeOnEffectElems = _doc.getElementsByClassName('writeOnEffect'),
		headerLine = _doc.getElementById('headerLine'),
		cursor = _doc.createElement('span'),
		writeOnData = [];

	// Apply writeOn text to array, then empty out the writeOn text
	for (var i = 0; i < writeOnEffectElems.length; i++) {
		var currentElem = writeOnEffectElems[i];
		writeOnData.push(currentElem.innerHTML);
		currentElem.innerHTML = '';
	}

	cursor.className = 'headerCursor';
	cursor.innerHTML = '&nbsp;';

	setTimeout(function() {
		writeOnEffect(writeOnEffectElems[0], writeOnData[0], secondWriteOnEffect);

		function secondWriteOnEffect() {
			// Calculation for intervalToCallback(48)
			// IntervalTime(50ms) * LoopAmount(68)) = LoopTime(3,400ms)
			// LoopTime(3,400ms) - LineAnimationDuration(1000ms) = AnimationStartTime(2,400ms)
			// AnimationStartTime(2,400ms) / IntervalTime(50ms) = 48
			writeOnEffect(writeOnEffectElems[1], writeOnData[1], 50, false, 48, thirdWriteOnEffect);
		}

		function thirdWriteOnEffect() {
			headerLine.style.transform = 'scaleX(1)';
		}
	}, 700);

	function writeOnEffect( /** DOM Element */ elem, /** String */ data, /** Number*/ intervalTime, /** Function: Optional */ endCallback, /** Number: Optional */ intervalToCallback, /** Function: Optional */ callbackAtInterval) {
		// Reason for why I don't use '||', see: http://www.codereadability.com/javascript-default-parameters-with-or-operator/
		if (!isElement(elem) || !(typeof data === 'string' || data instanceof String)) return;
		if (typeof intervalTime === 'function') endCallback = intervalTime;
		if (typeof intervalTime !== 'number') intervalTime = 100;
		if (typeof endCallback !== 'function') endCallback = emptyFunction;
		if (typeof intervalToCallback !== 'number' ||
			typeof callbackAtInterval !== 'function') intervalToCallback = false;

		var currentInterval = 0;

		elem.parentElement.appendChild(cursor);

		var writeOnInterval = setInterval(function() {
			currentInterval++;
			// Check if finished writing
			if (!data.length) {
				// Stop interval, then call callback function
				clearInterval(writeOnInterval);
				endCallback();
			} else {
				// Write first letter, then remove it from 'data'
				elem.innerHTML += data.charAt(0);
				data = data.slice(1);

				if (intervalToCallback && intervalToCallback === currentInterval) {
					callbackAtInterval();
				}
			}
		}, intervalTime);
	}
}


var scrollTopElem = (function() {
	var tempScrollTopElem = document.documentElement;
	// Cannot do `document.documentElement.scrollTop || document.body.scrollTop` i.e. `||`
	// because if the actual scrollTop is 0 right now, then we won't get the current browser
	// supported `document.x` type.
	if (tempScrollTopElem.scrollTop === 0) {
		// Attemps to add 1 to `scrollTopElem.scrollTop`
		++tempScrollTopElem.scrollTop;
		// Check to see if `scrollTopElem.scrollTop` applied the increment.
		// If not, `document.documentElement.scrollTop` isn't supported
		if (0 === tempScrollTopElem.scrollTop--) tempScrollTopElem = document.body;
	}
	return tempScrollTopElem;
})();

function scrollTo(scrollToPos, duration, elemToScroll) {
	if (typeof duration !== 'number' || duration <= 0) duration = 500;
	if (typeof scrollToPos === 'object') scrollToPos = scrollToPos.offsetTop;
	else if (typeof scrollToPos !== 'number') scrollToPos = 0;
	if (!isElement(elemToScroll)) elemToScroll = scrollTopElem;

	var scrollFromPos = elemToScroll.scrollTop,
		difference = scrollFromPos - scrollToPos,
		speed = 1 / duration * 20,
		time01 = 0;

	(function scrollToX() {
		if (time01 < 0 || time01 > 1) {
			elemToScroll.scrollTop = scrollToPos;
			return;
		}
		elemToScroll.scrollTop = scrollFromPos - (difference * easeInOutQuint(time01));
		time01 += speed;

		setTimeout(scrollToX, 20);
	})();
}

function easeInOutQuint(t) {
	t /= 0.5;
	if (t < 1) return t * t * t * t * t / 2;
	t -= 2;
	return (t * t * t * t * t + 2) / 2;
}


function emptyFunction() {}

function isElement(elem) {
	return (
		typeof HTMLElement === "object" ? elem instanceof HTMLElement : //DOM2
		elem && typeof elem === "object" && elem !== null && elem.nodeType === 1 && typeof elem.nodeName === "string"
	);
}