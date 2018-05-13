import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {render, renderIntoDocument, Simulate, wait, waitForElement} from "react-testing-library";
import FirebaseServer from 'firebase-server';
import Firebase from 'firebase';

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
  let app;
  let firebaseServer, firebaseApp;

  const getCategoryLabel = (labelText) => {
    const theLabel = app.getByText(labelText);
    expect(theLabel).toBeTruthy;
    return theLabel;
  };

  const getCategoryRadio = (labelText) => {
    const theRadio = app.getByLabelText(labelText);
    expect(theRadio).toBeTruthy;
    return theRadio;
  };

  const getTextArea = () => {
    return app.container.querySelector('textarea');
  };

  const getEyeballButton = () => {
    return app.getByText(eyeballEmoji);
  };

  const getNextButton = () => {
    return app.getByText(nextEmoji);
  };

  const checkRadio = (radio) => {
    radio.click();
    radio.checked = true;
    Simulate.change(radio);
  };

  const getBodyText = () => {
    return app.container.textContent;
  };

  const happyEmoji = '😃';
  const questionEmoji = '❓';
  const sadEmoji = '😟';
  const mehEmoji = '😕';
  const eyeballEmoji = '👁';
  const nextEmoji = '🔜';

  beforeAll(() => {
    firebaseServer = new FirebaseServer(5000, 'localhost');
    firebaseApp = Firebase.initializeApp({
      apiKey: 'something',
      databaseURL: 'ws://localhost:5000'
    }, 'specs');
  });

  afterAll((done) => {
    firebaseServer.close(done);
  });

  beforeEach(async () => {
    await firebaseApp.database().ref('cards').remove();
    app = render(<App firebaseApp={firebaseApp}/>);
  });

  describe('categories', () => {
    it('renders labels for each category', () => {
      const categoryButtons = app.container.querySelectorAll('label');
      expect(categoryButtons.length).toEqual(4);
      expect(categoryButtons[0].textContent).toEqual(happyEmoji);
      expect(categoryButtons[1].textContent).toEqual(questionEmoji);
      expect(categoryButtons[2].textContent).toEqual(mehEmoji);
      expect(categoryButtons[3].textContent).toEqual(sadEmoji);
    });

    it('can select only one category', () => {
      const happyLabel = getCategoryLabel('😃');
      const questionLabel = getCategoryLabel('❓');
      const mehLabel = getCategoryLabel('😕');
      const sadLabel = getCategoryLabel('😟');

      const happyRadio = getCategoryRadio(happyEmoji);
      const questionRadio = getCategoryRadio(questionEmoji);
      const mehRadio = getCategoryRadio(mehEmoji);
      const sadRadio = getCategoryRadio(sadEmoji);

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

  describe('when I fill out a card', () => {
    const cardText = `my new favorite number is ${Math.random()}`;

    beforeEach(() => {
      getTextArea().value = cardText;
      Simulate.change(getTextArea());
      checkRadio(getCategoryRadio(happyEmoji));
      expect(getTextArea().value).toEqual(cardText);
      getCategoryLabel(happyEmoji).click();
    });

    describe('when I press the next button', () => {
      beforeEach(() => {
        Simulate.click(getNextButton());
      });

      it('stops showing the text area and category radio buttons', () => {
        expect(getTextArea().value).toEqual('');
        expect(getCategoryRadio(happyEmoji).checked).toEqual(false);
        expect(getCategoryRadio(questionEmoji).checked).toEqual(false);
        expect(getCategoryRadio(mehEmoji).checked).toEqual(false);
        expect(getCategoryRadio(sadEmoji).checked).toEqual(false);
      });

      it('adds the card to the saved cards', async () => {
        Simulate.click(getEyeballButton());
        const card = await waitForElement(() => app.getByText(cardText, {exact: false}));
        expect(card).toBeTruthy();
      });
    });

    describe('when I press the eyeball', () => {
      beforeEach(() => {
        Simulate.click(getEyeballButton());
      });
      it('hides the textarea and buttons', () => {
        const textAreas = app.container.querySelectorAll('textarea');
        expect(textAreas.length).toEqual(0);

        expect(app.queryByLabelText(happyEmoji)).toBeFalsy();
        expect(app.queryByLabelText(questionEmoji)).toBeFalsy();
        expect(app.queryByLabelText(mehEmoji)).toBeFalsy();
        expect(app.queryByLabelText(sadEmoji)).toBeFalsy();

        expect(app.queryByText(eyeballEmoji)).toBeFalsy();
      });

      it('shows the card with the emotion', async () => {
        const card = await waitForElement(() => app.getByText(cardText, {exact: false}));

        expect(card).toBeTruthy();
        expect(card.textContent).toContain(happyEmoji);
      });

      it('shows how many cards have been written', async () => {
        const countDiv = await waitForElement(() => app.getByText(/[0-9]+ of [0-9]+/));
        expect(countDiv.textContent).toContain('1 of 1');
      });

      describe('when I fill out a card in another app instance (browser) and press the eyeball', () => {
        const secondCardText = 'Making reactro';
        let cardsSeen = {
          [cardText]: false,
          [secondCardText]: false
        };

        beforeEach(async () => {
          app = render(<App firebaseApp={firebaseApp}/>);

          changeInputValue(getTextArea(), secondCardText);
          checkRadio(getCategoryRadio(happyEmoji));

          Simulate.click(getEyeballButton());

          await wait(() => app.getByText(/1 of 2/));

          cardsSeen[cardText] = getBodyText().includes(cardText);
          cardsSeen[secondCardText] = getBodyText().includes(secondCardText);
        });

        it('shows that there are two cards', async () => {
          const countDiv = await waitForElement(() => app.getByText(/[0-9]+ of [0-9]+/));
          expect(countDiv.textContent).toContain('of 2');
        });

        it('only shows one of the cards', async () => {
          await wait(() => app.getByText(/1 of 2/));
          expect(cardsSeen[cardText] || cardsSeen[secondCardText]).toEqual(true);
          if(cardsSeen[cardText] == cardsSeen[secondCardText]){
            throw `expected to see only one of ${cardText} or ${secondCardText}, saw both`;
          }
        });
        describe('when I click on the next button', () => {
          beforeEach(() => {
            const nextButton = app.getByText('next');
            Simulate.click(nextButton);
          });

          it('shows the other card', async () => {
            await wait(() => app.getByText(/2 of 2/));
            if(cardsSeen[cardText]){
              expect(getBodyText()).not.toContain(cardText);
              expect(getBodyText()).toContain(secondCardText);
            } else {
              expect(getBodyText()).not.toContain(cardText);
              expect(getBodyText()).toContain(secondCardText);
            }
          })
        });
      });
    });
  });
});
