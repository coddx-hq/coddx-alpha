import * as React from 'react';
import styled from 'styled-components';

const emojis = [
  { text: '(bug)', char: '🐞', names: 'bug, ladybug, defect, issue, problem, error' },
  // JIRA emojis
  { text: ':)', char: '😊', names: 'smile, happy, glad' },
  { text: ':(', char: '😟', names: 'sad, unhappy, cry' },
  { text: ':P', char: '😛', names: 'tongue, fun' },
  { text: ':D', char: '😄', names: 'broad smile, big open smile, amusemed, excited, happy' },
  { text: ';)', char: '😉', names: 'wink' },
  { text: '(y)', char: '👍', names: 'yes, thumb up, okay, agree, correct, good' },
  { text: '(n)', char: '👎', names: 'no, thumb down, not okay, disagree, bad' },
  { text: '(on)', char: '☑️', names: 'on, ticked, checked, yes, done' },
  { text: '(off)', char: '🔲', names: 'off, unchecked, checkbox, empty box, square' },
  { text: '(!)', char: '⚠️', names: 'warning, attention, dangerous, exclamation' },
  { text: '(*)', char: '⭐', names: 'star, rate, favorite, favourite, award, reward' },
  { text: '(/)', char: '✅', names: 'ticked, checked, yes, done, correct' },
  { text: '(x)', char: '❌', names: 'crossed, deleted, blocked, wrong, incorrect, no' },
  { text: '(i)', char: 'ℹ️', names: 'info, information, attention' },
  { text: '(+)', char: '➕', names: 'plus, addition' },
  { text: '(-)', char: '➖', names: 'minus, substraction' },
  { text: '(?)', char: '❓', names: 'question mark, ask' },
  { text: '<3', char: '💗', names: 'heart, pink heart, love, happy' },
  { text: '</3', char: '💔', names: 'broken heart, unhappy, sad' },
  // More emojis
  { text: '(rocket)', char: '🚀', names: 'rocket, launch, delivered' },
  { text: '(party)', char: '🎉', names: 'party, celebration, firework, excited, awesome, funs, congratulations' },
  { text: '(sparkle)', char: '✨', names: 'sparkle' },
  { text: '(hot)', char: '🔥', names: 'hot, fire, flame, burn' },
  { text: '(fire)', char: '🔥', names: 'fire, hot, flame, burn' },
  { text: '(burger)', char: '🍔', names: 'burger, food' },
  { text: '(pizza)', char: '🍕', names: 'pizza, food' },
  { text: '(hotdog)', char: '🌭', names: 'hotdog, food' },
  { text: '(cake)', char: '🎂', names: 'cake, sweet' },
  { text: '(cupcake)', char: '🧁', names: 'cupcake, sweet' },
  { text: '(cookie)', char: '🍪', names: 'cookie, sweet' },
  { text: '(candy)', char: '🍬', names: 'candy, sweet' },
  { text: '(eat)', char: '🍽️', names: 'eat, dine, food, lunch, dinner' },
  { text: '(icecream)', char: '🍦', names: 'icecream, sweet' },
  { text: '(coffee)', char: '☕', names: 'coffee, cafe' },
  { text: '(wine)', char: '🍷', names: 'wine, drink' },
  { text: '(beer)', char: '🍺', names: 'beer, drink' },
  { text: '(balloon)', char: '🎈', names: 'balloon' },
  { text: '(rose)', char: '🌹', names: 'rose, flower' },
  { text: '(soccer)', char: '⚽', names: 'soccer, sport, ball' },
  { text: '(baseball)', char: '⚾', names: 'baseball, sport, ball' },
  { text: '(tennis)', char: '🎾', names: 'tennis, sport' },
  { text: '(football)', char: '🏈', names: 'football, sport' },
  { text: '(basketball)', char: '🏀', names: 'basketball, sport' },
  { text: '(car)', char: '🚗', names: 'car, travel, drive' },
  { text: '(plane)', char: '✈️', names: 'plane, travel, fly, flight' },
  { text: '(beach)', char: '🏖️', names: 'beach, relax, vacation' },
  { text: '(sun)', char: '☀️', names: 'sun, weather' },
  { text: '(moon)', char: '🌙', names: 'moon, night' },
  { text: '(rain)', char: '🌧️', names: 'rain, weather' },
  { text: '(snow)', char: '❄️', names: 'snow, weather' },
  { text: '(chart)', char: '📈', names: 'chart, presentation, stock' },
  { text: '(search)', char: '🔎', names: 'search, find, looking, research' }
];

const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  li {
    margin: 0;
    padding: 10px;
    cursor: pointer;
    &:hover {
      background-color: #777;
    }
  }
`;

export default function TaskMenu({ task, menuActive, setMenuActive, onChangeTask, setMainKey, setIsEditing }) {
  const [searchText, setSearchText] = React.useState('');
  const closeMenu = () => {
    setMenuActive('');
    setIsEditing(false);
  };
  return (
    <div
      style={{
        position: 'absolute',
        top: 25,
        left: 5,
        borderRadius: 4,
        backgroundColor: 'var(--vscode-tab-border)',
        width: 170,
        minHeight: 100,
        maxHeight: 250,
        overflowX: 'hidden',
        overflowY: 'auto',
        fontFamily: 'Verdana',
        fontSize: '0.8em',
        zIndex: 1
      }}
    >
      {menuActive === 'MENU' ? (
        <MenuList>
          <li
            onMouseDown={ev => {
              // can't use onClick as it will close the menu without coming here.
              ev.preventDefault();
              task.level = (task.level + 1) % 2;
              onChangeTask(task.id, task);
              closeMenu();
            }}
          >
            Toggle Task / Sub-task
          </li>
          <li
            onMouseDown={ev => {
              // can't use onClick as it will close the menu without coming here.
              ev.preventDefault();
              setMenuActive('EMOJI');
            }}
          >
            Insert Emoji Icon
          </li>
        </MenuList>
      ) : (
        <MenuList>
          <input
            autoFocus
            placeholder="Search"
            value={searchText}
            onChange={ev => setSearchText(ev.target.value)}
            onKeyUp={ev => {
              if (ev.keyCode === 27) {
                closeMenu();
              }
            }}
            style={{ width: '87%', margin: 5, padding: 3 }}
          />
          {emojis.map(emoji => {
            const txt = searchText.trim().toLowerCase();
            if (txt && emoji.names.toLowerCase().indexOf(txt) < 0) {
              return null;
            }
            return (
              <li
                onMouseDown={ev => {
                  ev.preventDefault();
                  task.content += emoji.char;
                  onChangeTask(task.id, task);
                  closeMenu();
                  setMainKey('key_' + Math.random());
                }}
              >
                <span style={{ fontSize: '1.5em' }}>{emoji.char}</span> &nbsp;&nbsp;&nbsp; {emoji.text}
              </li>
            );
          })}
        </MenuList>
      )}
    </div>
  );
}
