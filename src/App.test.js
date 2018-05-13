import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {findRenderedDOMComponentWithTag, scryRenderedDOMComponentsWithTag, Simulate} from 'react-dom/test-utils';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App/>, div);
  ReactDOM.unmountComponentAtNode(div);
});

function changeInputValue(input, newValue) {
  input.value = newValue;
  Simulate.change(input);
}

describe('filling out a card', () => {
  let div, app;

  const getCatagoryLabel = (labelText) => {
    const theLabel = scryRenderedDOMComponentsWithTag(app, 'label').find(label => label.textContent === labelText);
    expect(theLabel).toBeTruthy;
    return theLabel;
  };

  const getCatagoryRadio = (radioValue) => {
    const theRadio = scryRenderedDOMComponentsWithTag(app, 'input').find(radio => radio.value === radioValue);
    expect(theRadio).toBeTruthy;
    return theRadio;
  };

  const getTextArea = () => {
    return findRenderedDOMComponentWithTag(app, 'textarea');
  };

  const getEyeballButton = () => {
    return scryRenderedDOMComponentsWithTag(app, 'button')[0];
  };

  const checkRadio = (radio) => {
    radio.click();
    radio.checked = true;
    Simulate.change(radio);
  };

  const happyEmoji = '😃';
  const questionEmoji = '❓';
  const sadEmoji = '😟';
  const mehEmoji = '😕';

  beforeEach(() => {
    div = document.createElement('div');
    app = ReactDOM.render(<App/>, div);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
  });

  describe('categories', () => {
    it('renders labels for each category', () => {
      const categoryButtons = scryRenderedDOMComponentsWithTag(app, 'label');
      expect(categoryButtons.length).toEqual(4);
      expect(categoryButtons[0].textContent).toEqual(happyEmoji);
      expect(categoryButtons[1].textContent).toEqual(questionEmoji);
      expect(categoryButtons[2].textContent).toEqual(mehEmoji);
      expect(categoryButtons[3].textContent).toEqual(sadEmoji);
    });

    it('can select only one category', () => {
      const happyLabel = getCatagoryLabel('😃');
      const questionLabel = getCatagoryLabel('❓');
      const mehLabel = getCatagoryLabel('😕');
      const sadLabel = getCatagoryLabel('😟');

      const happyRadio = getCatagoryRadio('happy');
      const questionRadio = getCatagoryRadio('question');
      const mehRadio = getCatagoryRadio('meh');
      const sadRadio = getCatagoryRadio('sad');

      expect(happyRadio.checked).toEqual(false);
      expect(questionRadio.checked).toEqual(false);
      expect(mehRadio.checked).toEqual(false);
      expect(sadRadio.checked).toEqual(false);

      happyLabel.click();

      expect(happyRadio.checked).toEqual(true);
      expect(questionRadio.checked).toEqual(false);
      expect(mehRadio.checked).toEqual(false);
      expect(sadRadio.checked).toEqual(false);

      questionLabel.click();

      expect(happyRadio.checked).toEqual(false);
      expect(questionRadio.checked).toEqual(true);
      expect(mehRadio.checked).toEqual(false);
      expect(sadRadio.checked).toEqual(false);

      mehLabel.click();

      expect(happyRadio.checked).toEqual(false);
      expect(questionRadio.checked).toEqual(false);
      expect(mehRadio.checked).toEqual(true);
      expect(sadRadio.checked).toEqual(false);

      sadLabel.click();

      expect(happyRadio.checked).toEqual(false);
      expect(questionRadio.checked).toEqual(false);
      expect(mehRadio.checked).toEqual(false);
      expect(sadRadio.checked).toEqual(true);
    });
  });

  describe('when I fill out a card and press the eyeball', () => {
    const cardText = `my new favorite number is ${Math.random()}`;

    beforeEach(() => {
      getTextArea().value = cardText;
      Simulate.change(getTextArea());
      checkRadio(getCatagoryRadio('happy'));

      expect(getTextArea().value).toEqual(cardText);
      getCatagoryLabel(happyEmoji).click();
      Simulate.click(getEyeballButton());
    });

    it('hides the textarea and buttons', () => {
      const textAreas = scryRenderedDOMComponentsWithTag(app, 'textarea');
      expect(textAreas.length).toEqual(0);

      expect(getCatagoryRadio('happy')).toBeFalsy();
      expect(getCatagoryRadio('question')).toBeFalsy();
      expect(getCatagoryRadio('meh')).toBeFalsy();
      expect(getCatagoryRadio('sad')).toBeFalsy();

      expect(getEyeballButton()).toBeFalsy();
    });

    it('shows the card with the emotion', () => {
      expect(div.textContent).toContain(cardText);
      expect(div.textContent).toContain(happyEmoji);
    });

    it('shows how many cards have been written', () => {
      expect(div.textContent).toContain('1 of 1');
    });

    describe('when I fill out a card in another card and press the eyeball', () => {
      const secondCardText = 'Making reactro';

      beforeEach(() => {
        ReactDOM.unmountComponentAtNode(div);
        div = document.createElement('div');
        app = ReactDOM.render(<App/>, div);

        changeInputValue(getTextArea(), secondCardText);
        checkRadio(getCatagoryRadio('happy'));

        Simulate.click(getEyeballButton());
      });

      it('shows that there are two cards', () => {
        expect(div.textContent).toContain('2 of 2');
      })
    });
  });
});
