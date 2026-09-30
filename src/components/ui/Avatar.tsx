import { avatarIndex, initialsOf } from "../../utils/format";
import "./Avatar.css";

/** Палитра аватаров, как в MAX: каждому чату — свой стабильный цвет. */
const GRADIENTS = [
  "linear-gradient(135deg, #7a5cf0, #a97bf5)",
  "linear-gradient(135deg, #4f8df8, #61b6f7)",
  "linear-gradient(135deg, #f0655c, #f59a6b)",
  "linear-gradient(135deg, #2fb98c, #63d6a7)",
  "linear-gradient(135deg, #e8a33d, #f2c76a)",
  "linear-gradient(135deg, #e05ca8, #f27fc0)",
];

type AvatarProps = {
  chatId: string;
  name: string;
  size?: number;
};

export function Avatar({ chatId, name, size = 52 }: AvatarProps) {
  const background = GRADIENTS[avatarIndex(chatId, GRADIENTS.length)];

  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initialsOf(name)}
    </div>
  );
}
