if (
  !process.env.NO_COLOR &&
  String(process.env.COLOR_CONSOLE || "true").toLowerCase() !== "false" &&
  !process.env.FORCE_COLOR
) {
  process.env.FORCE_COLOR = "3";
}
