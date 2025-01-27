import chalkAnimation from 'chalk-animation';

export function handleExit() {
  console.log("\n"); // Add newline for cleaner output
  const rainbow = chalkAnimation.rainbow("Thanks for using LUNA! Goodbye!");

  // Stop the animation after 2 seconds and exit
  setTimeout(() => {
    rainbow.stop();
    process.exit(0);
  }, 2000);
}