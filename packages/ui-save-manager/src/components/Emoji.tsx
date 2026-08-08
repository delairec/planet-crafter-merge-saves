interface EmojiProps {
  content: string
}

export default function Emoji(props: EmojiProps) {
  return <span aria-hidden="true">{props.content}</span>
}