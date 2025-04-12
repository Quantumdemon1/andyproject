
import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const EMOJI_CATEGORIES = {
  'Smileys & People': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'],
  'Animals & Nature': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🦆', '🐔', '🐧', '🦅', '🦉'],
  'Food & Drink': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍆', '🥦', '🥬'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🥊', '🥋', '⛸️'],
  'Travel & Places': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🚨', '🚔', '🚍'],
  'Objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖱️', '🖨️', '🖋️', '📥', '📤', '📦', '📫', '📝', '📅', '📆', '🔒', '🔑', '🔨', '🧰'],
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  children: React.ReactNode;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, children }) => {
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(EMOJI_CATEGORIES)[0]);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content 
          className="bg-white/10 backdrop-blur-xl rounded-md border border-white/20 w-64 shadow-lg p-2"
          sideOffset={5}
          align="end"
        >
          <div className="mb-2 border-b border-white/10 pb-1 flex">
            {Object.keys(EMOJI_CATEGORIES).map(category => (
              <button
                key={category}
                className={`mr-1 last:mr-0 p-1 rounded-md text-xs ${activeCategory === category ? 'bg-white/10' : 'hover:bg-white/5'}`}
                onClick={() => setActiveCategory(category)}
              >
                {category.split(' ')[0]}
              </button>
            ))}
          </div>
          
          <ScrollArea className="h-56">
            <div className="p-2 grid grid-cols-7 gap-1">
              {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
                <button
                  key={index}
                  className="flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded cursor-pointer text-xl"
                  onClick={() => onEmojiSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </ScrollArea>
          <Popover.Arrow className="fill-white/10" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default EmojiPicker;
