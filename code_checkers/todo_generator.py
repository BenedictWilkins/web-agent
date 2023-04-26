#!/usr/bin/env python3

import os


INTERESTING_FILES_EXTENSIONS: list[str] = [".ts", ".tsx", ".jsx", ".cjs", ".cjsx", ".html", ".css", ".json", ".py", ".md", ".sh"]
TODO_FILE: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "TODO.md"))
FILES_EXCLUSION_LIST: list[str] = [os.path.basename(__file__), os.path.basename(TODO_FILE)]
NAMED_FILES_EXCLUSION_LIST: list[str] = ["package-lock.json"]
DIR_EXCLUSION_LIST: list[str] = ["node_modules", "dist", "parcel_dist", ".git", ".yarn"]
TODO_PATTERN: str = "TODO"
TODO_HEADER: str = "# List of TODOs"
PROJECT_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))


def main() -> None:
    lines: list[str] = []

    for dir, _, files in os.walk(PROJECT_DIR):
        if os.path.basename(dir) in DIR_EXCLUSION_LIST or any(d in dir for d in DIR_EXCLUSION_LIST):
            continue

        for f in filter(lambda candidate: any(filter(lambda ext: isinstance(ext, str) and candidate.endswith(ext), INTERESTING_FILES_EXTENSIONS)), files):
            if f not in NAMED_FILES_EXCLUSION_LIST and f not in FILES_EXCLUSION_LIST:
                lines += __look_for_todos(os.path.join(dir, f))

    with open(TODO_FILE, "w") as f:
        f.write(TODO_HEADER + "\n\n")

        for line in lines:
            f.write(line + "\n\n")

        f.write("**This file is autogenerated. Please do not edit it manually.**\n")
        f.flush()


def __look_for_todos(path: str) -> list[str]:
    to_add: list[str] = []
    path_to_print: str = __get_relative_path(absolute_path=path)
    prefix: str = "* File [{}](/{}): line ".format(path_to_print, path_to_print)
    lines: list[str] = []

    with open(path, "r") as f:
        lines = f.readlines()

    for i in range(len(lines)):
        line_number = i + 1

        if TODO_PATTERN in lines[i]:
            to_add.append(prefix + "{}: `{}`".format(line_number, lines[i].strip().replace("`", "'")))

    return to_add


def __get_relative_path(absolute_path: str) -> str:
    tokens: list[str] = absolute_path.split(os.path.sep)
    vw_top_dir: str = os.path.basename(PROJECT_DIR)

    while tokens[0] != vw_top_dir:
        tokens = tokens[1:]

        if len(tokens) < 2:
            raise ValueError("Malformed path: {}".format(absolute_path))

    tokens = tokens[1:]

    return os.path.join(*tokens)


if __name__ == "__main__":
    main()
