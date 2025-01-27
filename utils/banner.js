import figlet from "figlet";
import gradient from "gradient-string";

export function displayBanner() {
    return new Promise((resolve) => {
        figlet(
            "LUNA",
            {
                font: "Standard",
                horizontalLayout: "default",
                verticalLayout: "default",
            },
            function (err, data) {
                if (err) {
                    console.log(chalk.red("Something went wrong with the banner..."));
                    resolve();
                    return;
                }
                console.log(gradient.pastel.multiline(data));
                console.log("\n");
                resolve();
            }
        );
    });
}