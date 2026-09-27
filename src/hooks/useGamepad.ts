import { useEffect, useRef, useState, useCallback } from 'react';

export interface GamepadCallbacks {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onConfirm?: () => void; // A / Cross
  onBack?: () => void;    // B / Circle
  onActionX?: () => void; // X / Square
  onActionY?: () => void; // Y / Triangle
  onBumperL1?: () => void;
  onBumperR1?: () => void;
  onOptions?: () => void; // Start / Menu
}

export function useGamepad(callbacks: GamepadCallbacks) {
  const [isConnected, setIsConnected] = useState(false);
  const [controllerName, setControllerName] = useState<string>('');
  const [lastButton, setLastButton] = useState<string | null>(null);

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const lastActionTimeRef = useRef<number>(0);
  const prevButtonStatesRef = useRef<boolean[]>([]);

  // Haptic trigger
  const triggerHaptic = useCallback((duration = 40, strong = 0.3) => {
    if (typeof navigator === 'undefined') return;
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of gamepads) {
      if (gp && 'vibrationActuator' in gp && (gp as any).vibrationActuator) {
        try {
          (gp as any).vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration,
            weakMagnitude: strong * 0.7,
            strongMagnitude: strong,
          }).catch(() => {});
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    let animFrameId: number;

    const handleGamepadConnected = (e: GamepadEvent) => {
      setIsConnected(true);
      setControllerName(e.gamepad.id || 'Gamepad Connected');
    };

    const handleGamepadDisconnected = () => {
      const remaining = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
      if (remaining.length === 0) {
        setIsConnected(false);
        setControllerName('');
      } else {
        setControllerName((remaining[0] as Gamepad).id);
      }
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Initial check
    if (navigator.getGamepads) {
      const active = Array.from(navigator.getGamepads()).filter(Boolean);
      if (active.length > 0) {
        setIsConnected(true);
        setControllerName((active[0] as Gamepad).id);
      }
    }

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

      if (gp) {
        if (!isConnected) {
          setIsConnected(true);
          setControllerName(gp.id);
        }

        const now = performance.now();
        const THROTTLE = 190; // ms between continuous axis navigations
        const DEADZONE = 0.5;

        // Check Analog Sticks
        const axisX = gp.axes[0] || 0;
        const axisY = gp.axes[1] || 0;

        if (now - lastActionTimeRef.current > THROTTLE) {
          if (axisX < -DEADZONE) {
            callbacksRef.current.onLeft?.();
            triggerHaptic(20, 0.2);
            setLastButton('Stick Left');
            lastActionTimeRef.current = now;
          } else if (axisX > DEADZONE) {
            callbacksRef.current.onRight?.();
            triggerHaptic(20, 0.2);
            setLastButton('Stick Right');
            lastActionTimeRef.current = now;
          } else if (axisY < -DEADZONE) {
            callbacksRef.current.onUp?.();
            triggerHaptic(20, 0.2);
            setLastButton('Stick Up');
            lastActionTimeRef.current = now;
          } else if (axisY > DEADZONE) {
            callbacksRef.current.onDown?.();
            triggerHaptic(20, 0.2);
            setLastButton('Stick Down');
            lastActionTimeRef.current = now;
          }
        }

        // Check Digital Buttons with edge detection (press down)
        const currentButtons = gp.buttons.map(b => b.pressed);
        const prevButtons = prevButtonStatesRef.current;

        const isJustPressed = (btnIndex: number) => {
          return currentButtons[btnIndex] && !prevButtons[btnIndex];
        };

        // Standard Gamepad mapping:
        // 0: A / Cross
        // 1: B / Circle
        // 2: X / Square
        // 3: Y / Triangle
        // 4: L1
        // 5: R1
        // 9: Options / Start
        // 12: D-pad Up
        // 13: D-pad Down
        // 14: D-pad Left
        // 15: D-pad Right

        if (isJustPressed(14)) {
          callbacksRef.current.onLeft?.();
          triggerHaptic(30, 0.25);
          setLastButton('D-Pad Left');
        }
        if (isJustPressed(15)) {
          callbacksRef.current.onRight?.();
          triggerHaptic(30, 0.25);
          setLastButton('D-Pad Right');
        }
        if (isJustPressed(12)) {
          callbacksRef.current.onUp?.();
          triggerHaptic(30, 0.25);
          setLastButton('D-Pad Up');
        }
        if (isJustPressed(13)) {
          callbacksRef.current.onDown?.();
          triggerHaptic(30, 0.25);
          setLastButton('D-Pad Down');
        }
        if (isJustPressed(0)) {
          callbacksRef.current.onConfirm?.();
          triggerHaptic(50, 0.5);
          setLastButton('✕ Cross / A');
        }
        if (isJustPressed(1)) {
          callbacksRef.current.onBack?.();
          triggerHaptic(30, 0.3);
          setLastButton('◯ Circle / B');
        }
        if (isJustPressed(2)) {
          callbacksRef.current.onActionX?.();
          triggerHaptic(40, 0.35);
          setLastButton('▢ Square / X');
        }
        if (isJustPressed(3)) {
          callbacksRef.current.onActionY?.();
          triggerHaptic(40, 0.35);
          setLastButton('△ Triangle / Y');
        }
        if (isJustPressed(4)) {
          callbacksRef.current.onBumperL1?.();
          triggerHaptic(35, 0.3);
          setLastButton('L1 Bumper');
        }
        if (isJustPressed(5)) {
          callbacksRef.current.onBumperR1?.();
          triggerHaptic(35, 0.3);
          setLastButton('R1 Bumper');
        }
        if (isJustPressed(9)) {
          callbacksRef.current.onOptions?.();
          triggerHaptic(45, 0.4);
          setLastButton('Options / Start');
        }

        prevButtonStatesRef.current = currentButtons;
      }

      animFrameId = requestAnimationFrame(pollGamepad);
    };

    animFrameId = requestAnimationFrame(pollGamepad);

    // Keyboard Fallback for testing without a gamepad
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          callbacksRef.current.onLeft?.();
          setLastButton('Arrow Left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          callbacksRef.current.onRight?.();
          setLastButton('Arrow Right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          callbacksRef.current.onUp?.();
          setLastButton('Arrow Up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          callbacksRef.current.onDown?.();
          setLastButton('Arrow Down');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          callbacksRef.current.onConfirm?.();
          setLastButton('Enter (✕)');
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          callbacksRef.current.onBack?.();
          setLastButton('Escape (◯)');
          break;
        case 'q':
        case 'Q':
        case '[':
          e.preventDefault();
          callbacksRef.current.onBumperL1?.();
          setLastButton('L1 [Q]');
          break;
        case 'e':
        case 'E':
        case ']':
          e.preventDefault();
          callbacksRef.current.onBumperR1?.();
          setLastButton('R1 [E]');
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          callbacksRef.current.onActionX?.();
          setLastButton('Info (▢)');
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          callbacksRef.current.onActionY?.();
          setLastButton('Search (△)');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isConnected, triggerHaptic]);

  return {
    isConnected,
    controllerName,
    lastButton,
    triggerHaptic,
  };
}
