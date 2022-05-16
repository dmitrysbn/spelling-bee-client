import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('<App />', () => {
  beforeEach(() => {
    localStorage.clear();

    render(<App puzzle={puzzle} mainLetter={mainLetter} />);
  });

  const puzzle = 'HOCIGEDNT';
  const mainLetter = 'G';

  it('renders the App page', () => {
    const title = screen.getByText('Spelling Bee :)');
    expect(title).toBeInTheDocument();

    const wordsFound = screen.getByText('You have found 0 words');
    expect(wordsFound).toBeInTheDocument();
  });

  it('Clicks in a legal word', () => {
    const g = screen.getByText('G');
    const o = screen.getByText('O');
    const n = screen.getByText('N');
    const h = screen.getByText('H');

    // clicks 'GONGH'
    userEvent.click(g);
    userEvent.click(o);
    userEvent.click(n);
    userEvent.click(g);
    userEvent.click(h);

    // deletes the last letter
    const deleteButton = screen.getByText('Delete');
    userEvent.click(deleteButton);

    // clicks Enter
    const enterButton = screen.getByText('Enter');
    userEvent.click(enterButton);

    const error = screen.queryByText('Already found');
    expect(error).not.toBeInTheDocument();

    const foundWord = screen.getByText('Gong');
    expect(foundWord).toBeInTheDocument();
  });

  it('Submits empty term', () => {
    const form = screen.getByTestId('form');

    // presses enter
    userEvent.type(form, '{enter}');

    const error = screen.queryByText('Already found');
    expect(error).not.toBeInTheDocument();
  });

  it('Types in a legal word', () => {
    const form = screen.getByTestId('form');

    // types in 'GONG' and presses enter
    userEvent.type(form, 'GONG{enter}');

    const foundWord = screen.getByText('Gong');
    expect(foundWord).toBeInTheDocument();
  });

  describe('Validation', () => {
    it('Too short', () => {
      const form = screen.getByTestId('form');

      // types in 'GON'
      userEvent.type(form, 'GON{enter}');

      const error = screen.queryByText('Too short');
      expect(error).toBeInTheDocument();
    });

    it('Bad letters', () => {
      const form = screen.getByTestId('form');

      // types in 'LOLZ'
      userEvent.type(form, 'LOLZ{enter}');

      const error = screen.queryByText('Bad letters');
      expect(error).toBeInTheDocument();
    });

    it('Missing center letter', () => {
      const form = screen.getByTestId('form');

      // types in 'CENT'
      userEvent.type(form, 'CENT{enter}');

      const error = screen.queryByText('Missing center letter');
      expect(error).toBeInTheDocument();
    });

    it('Not in word list', () => {
      const form = screen.getByTestId('form');

      // types in 'GONGING'
      userEvent.type(form, 'GONGING{enter}');

      const error = screen.queryByText('Not in word list');
      expect(error).toBeInTheDocument();
    });

    it('Already found', async () => {
      const form = screen.getByTestId('form');

      // types in 'GONG'
      userEvent.type(form, 'GONG{enter}');

      // types in 'GONG again'
      userEvent.type(form, 'GONG{enter}');

      let error = screen.queryByText('Already found');
      expect(error).toBeInTheDocument();

      await waitForElementToBeRemoved(screen.queryByText('Already found'));
      expect(error).not.toBeInTheDocument();
    });
  });
});
