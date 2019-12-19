import api from '../../src/scene/api.js';
import Storybook from './js/storybook.js';

api.preload.sounds('storybook_load_sounds');
api.preload.images(
	'img/chapter-1.svg',
	'img/chapter-2.svg',
	'img/chapter-3.svg',
	'img/chapter-4.svg',
	'img/chapter-5.svg',
	'img/chapter-6.svg',
	'img/chapter-7.svg',
	'img/chapter-8.svg',
	'img/chapter-9.svg',
	'img/chapter-10.svg',
	'img/chapter-11.svg',
	'img/chapter-12.svg',
	'img/chapter-13.svg',
	'img/chapter-14.svg',
	'img/chapter-15.svg',
	'img/chapter-16.svg',
	'img/chapter-17.svg',
	'img/chapter-18.svg',
	'img/chapter-19.svg',
	'img/chapter-20.svg',
	'img/mobile/chapter-1.svg',
	'img/mobile/chapter-2.svg',
	'img/mobile/chapter-3.svg',
	'img/mobile/chapter-4.svg',
	'img/mobile/chapter-5.svg',
	'img/mobile/chapter-6.svg',
	'img/mobile/chapter-7.svg',
	'img/mobile/chapter-8.svg',
	'img/mobile/chapter-9.svg',
	'img/mobile/chapter-10.svg',
	'img/mobile/chapter-11.svg',
	'img/mobile/chapter-12.svg',
	'img/mobile/chapter-13.svg',
	'img/mobile/chapter-14.svg',
	'img/mobile/chapter-15.svg',
	'img/mobile/chapter-16.svg',
	'img/mobile/chapter-17.svg',
	'img/mobile/chapter-18.svg',
	'img/mobile/chapter-19.svg',
	'img/mobile/chapter-20.svg',
);

api.config({
	sound: ['storybook_start'],
});

api.ready(async () => {
  new Storybook(document.getElementById('module-storybook'));
})