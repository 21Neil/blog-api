
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';

const extension = [
  StarterKit.configure({ link: false }),
  Link,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Color,
  TextStyle,
  Image.configure({
    resize: {
      enabled: true,
      alwaysPreserveAspectRatio: true,
    },
  }),

];

const tiptapConverter = (JSONContent) => {
  if (!JSONContent) return '';
  const HTMLContent = generateHTML(JSON.parse(JSONContent), extension)

  return HTMLContent.replace(/\s*xmlns="[^"]*"/g, '')
};

export default tiptapConverter;
