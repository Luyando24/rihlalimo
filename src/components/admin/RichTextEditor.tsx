'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

export default function RichTextEditor({ content, onChange }: { content: string, onChange: (content: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border border-gray-200 rounded-b-lg',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('URL')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('bold') ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('italic') ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('strike') ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
        >
          Strike
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('heading', { level: 1 }) ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('heading', { level: 2 }) ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('heading', { level: 3 }) ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('bulletList') ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('orderedList') ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
        >
          Numbered List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${editor.isActive('blockquote') ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
        >
          Quote
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={addImage}
          className="px-2 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
        >
          Add Image
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
