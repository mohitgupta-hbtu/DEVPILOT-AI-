import { Variants } from "framer-motion";

export const fadeIn = (duration = 0.2, delay = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration, delay, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration, ease: "easeIn" },
  },
});

export const scaleUp = (duration = 0.25, delay = 0): Variants => ({
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration, delay, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration, ease: "easeIn" },
  },
});

export const slideInUp = (duration = 0.3, delay = 0, distance = 10): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: distance,
    transition: { duration, ease: "easeIn" },
  },
});

export const slideInLeft = (duration = 0.3, delay = 0, distance = 20): Variants => ({
  hidden: { opacity: 0, x: -distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration, delay, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -distance,
    transition: { duration, ease: "easeIn" },
  },
});

export const slideInRight = (duration = 0.3, delay = 0, distance = 20): Variants => ({
  hidden: { opacity: 0, x: distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration, delay, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: distance,
    transition: { duration, ease: "easeIn" },
  },
});

export const staggerContainer = (staggerChildren = 0.05, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const staggerItem = (duration = 0.25, distance = 10): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: "easeOut" },
  },
});

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 5,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};
