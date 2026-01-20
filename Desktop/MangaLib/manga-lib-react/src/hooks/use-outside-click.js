import { useEffect } from "react";

export const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const listener = (event) => {
      // 如果点击的是 ref 内部，或者是滚动条等，不做处理
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};