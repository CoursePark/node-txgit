'use strict';

module.exports = function (content) {
	return content.toString().replace(/^<!ENTITY /gm, '<');
};
