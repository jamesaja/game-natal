import '../../../src/elements/santa-choice.js';

import {html, LitElement} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat';

import * as prefix from '../../../src/lib/prefix.js';
import * as defs from '../defs.js';


const categoryNames = [
  'body',
  'hair',
  'glasses',
  'ears',
  'hats',
  'accessories',
  'backgrounds',
];


const colorProperties = {
  'skinTone': 'skin',
  'hairColor': 'hair',
  'suitColor': 'color',
  'glassesColor': 'glasses',
  'earsColor': 'color',
  'hatsColor': 'color',
  'accessoriesColor': 'color'
};


const colorPropertyNames = Object.keys(colorProperties);


const defaultCategoryChoices = (random=false) => categoryNames.reduce((defaultChoice, categoryName) => {
  if (random) {
    const length = (defs.categories[categoryName] || []).length;

    // weight the first choice by +1/length (categories with fewer weight 1st higher)
    let choice = Math.random() * length * (1 + 1 / length);
    if (choice >= length) {
      choice = 0;
    } else {
      choice = ~~choice;
    }
    defaultChoice[categoryName] = choice;
  } else {
    defaultChoice[categoryName] = 0;
  }
  return defaultChoice;
}, {});


const defaultPropertyColors = () =>
    Object.keys(colorProperties).reduce((propertyColors, property) => {
      propertyColors[property] = defs.random(colorProperties[property]);
      return propertyColors;
    }, {});


export class MakerControlElement extends LitElement {
  static get properties() {
    return {
      _idPrefix: {type: String},
      category: {type: String},

      skinTone: {type: String},
      hairColor: {type: String},
      suitColor: {type: String},
      glassesColor: {type: String},
      earsColor: {type: String},
      hatsColor: {type: String},
      accessoriesColor: {type: String},

      categoryChoice: {type: Object},

      svgStyle: {type: String},

      _previews: {type: Object},
    };
  }

  /**
   * Choose a random config, including random category choices. Note that this is only called when
   * the user explicitly asks for a random elf, normally only colors are random.
   */
  chooseRandom() {
    const categoryChoice = defaultCategoryChoices(true);
    const propertyColors = defaultPropertyColors();

    this.categoryChoice = categoryChoice;
    Object.assign(this, propertyColors);
  }

  serializeState() {
    const serialized = [];

    categoryNames.forEach((categoryName) => {
      serialized.push(this.categoryChoice[categoryName]);
    });
    serialized.push('|');  // put a nonce in case we change the number of categories later

    colorPropertyNames.forEach((colorPropertyName) => {
      serialized.push(this[colorPropertyName]);
    });

    return window.btoa(serialized.join(','));
  }

  deserializeState(state) {
    const categoryChoice = defaultCategoryChoices();
    const propertyColors = defaultPropertyColors();

    if (state) {
      let decoded = '';
      try {
        decoded = window.atob(state);
      } catch (e) {
        // ignore
      }

      let colorsFromIndex = null;
      decoded.split(',').forEach((choiceString, index) => {
        if (choiceString === '|') {
          colorsFromIndex = index + 1;
        } else if (colorsFromIndex === null) {
          const feature = categoryNames[index];

          // TODO(samthor): validate that this numbered choice is OK
          categoryChoice[feature] = self.parseInt(choiceString, 10) || 0;
        } else {
          const propertyIndex = index - colorsFromIndex;
          const property = colorPropertyNames[propertyIndex];

          if (defs.colors[choiceString]) {
            // sanity-check in case we change colors, don't set the value
            propertyColors[property] = choiceString;
          }
        }
      });
    }

    this.categoryChoice = categoryChoice;
    Object.assign(this, propertyColors);
  }

  constructor() {
    super();
    this._idPrefix = prefix.id();

    // At ctor time, we don't yet have state to deserialize. It'll probably arrive right after,
    // but just use defaults for now.
    this.deserializeState(null);
  }

  renderSvgStyle() {
    const renderClass = (name, prop, value) => {
      const colors = defs.colors[value];
      return colors.map((color, i) => `.${name}${i || ''}{${prop}:${color}}`).join('');
    };
    return `
${renderClass('suit', 'fill', this.suitColor)}
${renderClass('hats', 'fill', this.hatsColor)}
${renderClass('glasses', 'fill', this.glassesColor)}
.glasses-stroke {
  fill: none; stroke: ${defs.colors[this.glassesColor][0]}; stroke-width: 5px;
}
${renderClass('ears', 'fill', this.earsColor)}
${renderClass('limb', 'stroke', this.suitColor)}
${renderClass('skin', 'fill', this.skinTone)}
${renderClass('hair', 'fill', this.hairColor)}
${renderClass('accessories', 'fill', this.accessoriesColor)}
    `;
  }

  update(changedProperties) {
    for (const k of changedProperties.keys()) {
      if (k[0] !== '_') {
        this.svgStyle = this.renderSvgStyle();
        this.dispatchEvent(new CustomEvent('change'));
        break;
      }
    }

    if (changedProperties.has('category')) {
      this._previews = defs.categories[this.category] || [];
    }
    this.playChangeSound(changedProperties);
    return super.update(changedProperties);
  }

  playChangeSound(changedProperties) {
    if (changedProperties.has('_idPrefix')) {
      return; // first event, play no sound
    }
    if (changedProperties.has('category')) {
      window.santaApp.fire('sound-trigger', 'elfmaker_switch_type');
    } else if (changedProperties.has('categoryChoice')) {
      window.santaApp.fire('sound-trigger', 'elfmaker_switch_item');
    } else {
      window.santaApp.fire('sound-trigger', 'elfmaker_switch_color');
    }
  }
  _categoryChange(ev) {
    this.category = ev.detail.value;
  }

  _chooser(prop, mode) {
    const change = (ev) => {
      this[prop] = ev.detail.value;
    };
    return html`
      <maker-chooser mode=${mode} value=${this[prop]} @change=${change}></maker-chooser>
    `;
  }

  _renderCategory(category) {
    switch (category) {
      case 'body':
        return html`
          ${this._chooser('skinTone', 'skin')}
        `;
      case 'suit':
        return html`
          ${this._chooser('suitColor', 'color')}
        `;
      case 'hair':
        return html`
          ${this._chooser('hairColor', 'hair')}
        `;
      case 'glasses':
        return html`
          ${this._chooser('glassesColor', 'glasses')}
        `;
      case 'ears':
        return html`
          ${this._chooser('earsColor', 'color')}
        `;
      case 'hats':
        return html`
          ${this._chooser('hatsColor', 'color')}
        `;
      case 'accessories':
        return html`
          ${this._chooser('accessoriesColor', 'color')}
        `;
    }
    return '';
  }

  _onPreviewChange(ev) {
    this.categoryChoice = Object.freeze({
      ...this.categoryChoice,
      [this.category]: +ev.target.value,
    });
  }

  render() {
    // all category types except 'body' use the shared elf head to preview look, so override sizes
    // for displaying a larger elf body
    const lowerIndent = (this.category === 'hats' ? 0 : 80);
    const head = (this.category !== 'body') ? defs.head : '';

    const inner = this._renderCategory(this.category);
    const choice = this.categoryChoice[this.category] || 0;

    const previews = repeat(this._previews, (p, i) => `${this.category}${i}`, (p, i) => {
      let front = '';
      let back = '';

      if (this.category === 'hats') {
        back = p;
      } else {
        front = p;
      }

      return html`
<label class="item">
  <input type="radio" name="${this._idPrefix}preview" value=${i} .checked=${choice === i} />
  <div class="preview">
    ${this.category === 'backgrounds' ? html`
<div style="background: url(${p}) center/cover; width: 100%"></div>
    ` : html`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${defs.width * 0.2} ${lowerIndent} ${defs.width * 0.6} ${345 - lowerIndent}">
<g transform="translate(55)">
  <g class=${this.category}>${back}</g>
  ${head}
  <g class=${this.category}>${front}</g>
</g>
</svg>
    `}
  </div>
</label>
      `;
    });

    return html`
<style>${_style`maker-control`}</style>
<style>${defs.baseSvgStyle}${this.svgStyle}</style>
<main>
  ${this._chooser('category', 'category')}
  ${inner}

  <santa-choice>
    <div class="previews" @change=${this._onPreviewChange}>
      ${previews}
    </div>
  </santa-choice>
</main>
    `;
  }
}

customElements.define('maker-control', MakerControlElement);