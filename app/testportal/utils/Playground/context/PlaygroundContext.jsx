"use client";
import { createContext, useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { setLstorage, getLstorage } from "../../storageMiddleware";

export const PlaygroundContext = createContext();

export const languageList = [
  {
    key: "assembly",
    id: 45,
    defaultCode: `section .data
    hello db 'Hello World!',0

section .text
    global _start

_start:
    ; write hello to stdout
    mov eax, 4 ; sys_write
    mov ebx, 1 ; stdout
    mov ecx, hello
    mov edx, 12 ; length
    int 0x80
    
    ; exit
    mov eax, 1 ; sys_exit
    xor ebx, ebx ; return 0
    int 0x80`,
  },
  {
    key: "bash",
    id: 46,
    defaultCode: '#!/bin/bash\necho "Hello World!"',
  },
  {
    key: "basic",
    id: 47,
    defaultCode: 'PRINT "Hello World!"',
  },
  {
    key: "c",
    id: 48,
    defaultCode:
      '#include <stdio.h>\n\nint main() {\n\tprintf("Hello World!");\n\treturn 0;\n}',
  },
  {
    key: "c++",
    id: 54,
    defaultCode:
      '#include <iostream>\nusing namespace std;\n\nint main() {\n\tcout << "Hello World!";\n\treturn 0;\n}',
  },
  {
    key: "csharp",
    id: 51,
    defaultCode:
      'using System;\n\nclass Program {\n\tstatic void Main() {\n\t\tConsole.WriteLine("Hello World!");\n\t}\n}',
  },
  {
    key: "clojure",
    id: 86,
    defaultCode: '(println "Hello World!")',
  },
  {
    key: "cobol",
    id: 77,
    defaultCode:
      '       IDENTIFICATION DIVISION.\n       PROGRAM-ID. HELLO.\n       PROCEDURE DIVISION.\n           DISPLAY "Hello World!".\n           STOP RUN.',
  },
  {
    key: "c#",
    id: 77,
    defaultCode: `using System;

class Program {
    static void Main(string[] args) {
        Console.WriteLine("Hello World!");
    }
}`,
  },
  {
    key: "commonlisp",
    id: 55,
    defaultCode: '(format t "Hello World!")',
  },
  {
    key: "dart",
    id: 90,
    defaultCode: "void main() {\n\tprint('Hello World!');\n}",
  },
  {
    key: "d",
    id: 56,
    defaultCode:
      'import std.stdio;\n\nvoid main() {\n\twriteln("Hello World!");\n}',
  },
  {
    key: "elixir",
    id: 57,
    defaultCode: 'IO.puts "Hello World!"',
  },
  {
    key: "erlang",
    id: 58,
    defaultCode: 'main(_) ->\n\tio:fwrite("Hello World!\\n").',
  },
  {
    key: "f#",
    id: 90,
    defaultCode: `open System
let main argv =
    printfn "Hello World!"
    0 // return an integer exit code`,
  },
  {
    key: "fsharp",
    id: 87,
    defaultCode: 'printfn "Hello World!"',
  },
  {
    key: "fortran",
    id: 59,
    defaultCode: 'program hello\n\tprint *, "Hello World!"\nend program hello',
  },
  {
    key: "go",
    id: 60,
    defaultCode:
      'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello World!")\n}',
  },
  {
    key: "groovy",
    id: 88,
    defaultCode: 'println "Hello World!"',
  },
  {
    key: "haskell",
    id: 61,
    defaultCode: 'main = putStrLn "Hello World!"',
  },
  {
    key: "java",
    id: 62,
    defaultCode:
      'public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World!");\n\t}\n}',
  },
  {
    key: "javascript",
    id: 63,
    defaultCode: 'console.log("Hello World!");',
  },
  {
    key: "kotlin",
    id: 78,
    defaultCode: 'fun main() {\n\tprintln("Hello World!")\n}',
  },
  {
    key: "lua",
    id: 64,
    defaultCode: 'print("Hello World!")',
  },
  {
    key: "objectivec",
    id: 79,
    defaultCode:
      '#import <Foundation/Foundation.h>\n\nint main() {\n\t@autoreleasepool {\n\t\tNSLog(@"Hello World!");\n\t}\n\treturn 0;\n}',
  },
  {
    key: "ocaml",
    id: 65,
    defaultCode: 'print_endline "Hello World!"',
  },
  {
    key: "octave",
    id: 66,
    defaultCode: 'printf("Hello World!\\n");',
  },
  {
    key: "pascal",
    id: 67,
    defaultCode: "program HelloWorld;\nbegin\n\tWriteLn('Hello World!');\nend.",
  },
  {
    key: "perl",
    id: 85,
    defaultCode: 'print "Hello World!\\n";',
  },
  {
    key: "php",
    id: 68,
    defaultCode: '<?php\necho "Hello World!";\n?>',
  },
  {
    key: "prolog",
    id: 69,
    defaultCode:
      ":- initialization(main).\n\nmain :- write('Hello World!'), nl, halt.",
  },
  {
    key: "python",
    id: 71,
    defaultCode: 'print("Hello World!")',
  },
  {
    key: "r",
    id: 80,
    defaultCode: 'cat("Hello World!\\n")',
  },
  {
    key: "ruby",
    id: 72,
    defaultCode: 'puts "Hello World!"',
  },
  {
    key: "rust",
    id: 73,
    defaultCode: 'fn main() {\n\tprintln!("Hello World!");\n}',
  },
  {
    key: "scala",
    id: 81,
    defaultCode: 'object Main extends App {\n\tprintln("Hello World!")\n}',
  },
  {
    key: "sql",
    id: 82,
    defaultCode: "SELECT 'Hello World!' AS greeting;",
  },
  {
    key: "swift",
    id: 83,
    defaultCode: 'print("Hello World!")',
  },
  {
    key: "typescript",
    id: 74,
    defaultCode: 'console.log("Hello World!");',
  },
  {
    key: "visual",
    id: 84,
    defaultCode:
      'Imports System\n\nModule Program\n\tSub Main()\n\t\tConsole.WriteLine("Hello World!")\n\tEnd Sub\nEnd Module',
  },
];

const PlaygroundProvider = ({ children }) => {
  const initialItems = {
    [uuid()]: {
      title: "DSA",
      playgrounds: {
        [uuid()]: {
          title: "Stack Implementation",
          language: "c++",
          // code: languageMap["c++"].defaultCode,
        },
        [uuid()]: {
          name: "Array",
          language: "javascript",
          // code: languageMap["javascript"].defaultCode,
        },
      },
    },
  };

  const [folders, setFolders] = useState(() => {
    let localData = getLstorage("playgrounds-data");
    if (localData === null || localData === undefined) {
      return initialItems;
    }

    return JSON.parse(localData);
  });

  useEffect(() => {
    setLstorage("playgrounds-data", JSON.stringify(folders));
  }, [folders]);

  const deleteCard = (folderId, cardId) => {
    setFolders((oldState) => {
      const newState = { ...oldState };
      delete newState[folderId].playgrounds[cardId];
      return newState;
    });
  };

  const deleteFolder = (folderId) => {
    setFolders((oldState) => {
      const newState = { ...oldState };
      delete newState[folderId];
      return newState;
    });
  };

  const addFolder = (folderName) => {
    setFolders((oldState) => {
      const newState = { ...oldState };

      newState[uuid()] = {
        title: folderName,
        playgrounds: {},
      };

      return newState;
    });
  };

  const addPlayground = (folderId, playgroundName, language) => {
    setFolders((oldState) => {
      const newState = { ...oldState };

      newState[folderId].playgrounds[uuid()] = {
        title: playgroundName,
        language: language,
        // code: languageMap[language].defaultCode,
      };

      return newState;
    });
  };

  const addPlaygroundAndFolder = (folderName, playgroundName, cardLanguage) => {
    setFolders((oldState) => {
      const newState = { ...oldState };

      newState[uuid()] = {
        title: folderName,
        playgrounds: {
          [uuid()]: {
            title: playgroundName,
            language: cardLanguage,
            // code: languageMap[cardLanguage].defaultCode,
          },
        },
      };

      return newState;
    });
  };

  const editFolderTitle = (folderId, folderName) => {
    setFolders((oldState) => {
      const newState = { ...oldState };
      newState[folderId].title = folderName;
      return newState;
    });
  };

  const editPlaygroundTitle = (folderId, cardId, PlaygroundTitle) => {
    setFolders((oldState) => {
      const newState = { ...oldState };
      newState[folderId].playgrounds[cardId].title = PlaygroundTitle;
      return newState;
    });
  };

  const savePlayground = (folderId, cardId, newCode, newLanguage) => {
    setFolders((oldState) => {
      const newState = { ...oldState };
      newState[folderId].playgrounds[cardId].code = newCode;
      newState[folderId].playgrounds[cardId].language = newLanguage;
      return newState;
    });
  };

  const PlayGroundFeatures = {
    folders: folders,
    deleteCard: deleteCard,
    deleteFolder: deleteFolder,
    addFolder: addFolder,
    addPlayground: addPlayground,
    addPlaygroundAndFolder: addPlaygroundAndFolder,
    editFolderTitle: editFolderTitle,
    editPlaygroundTitle: editPlaygroundTitle,
    savePlayground: savePlayground,
  };

  return (
    <PlaygroundContext.Provider value={PlayGroundFeatures}>
      {children}
    </PlaygroundContext.Provider>
  );
};

export default PlaygroundProvider;
