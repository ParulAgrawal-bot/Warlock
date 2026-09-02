// Simplified Programming Languages & Concise Starter Code

export const LANGUAGES = [
  {
    id: 'javascript',
    name: 'JavaScript',
    monacoLang: 'javascript',
    icon: '⚡',
    code: `// 🎮 Simple JavaScript Game Loop
let score = 0;
const hero = { name: "Cyber Knight", hp: 100 };

function attack(enemy, dmg) {
  score += dmg * 10;
  console.log(\`⚔️ \${hero.name} hits \${enemy} for \${dmg} DMG! Score: \${score}\`);
}

attack("Void Drone", 25);
attack("Cyber Dragon", 50);
console.log("🏆 Victory! Final Score:", score);
`
  },
  {
    id: 'python',
    name: 'Python',
    monacoLang: 'python',
    icon: '🐍',
    code: `# 🐍 Simple Python Game Demo
hero = "Shadow Ninja"
enemies = ["Cyber Drone", "Glitch Beast", "Mech Boss"]
score = 0

for enemy in enemies:
    score += 100
    print(f"⚔️ {hero} defeated {enemy}! (+100 PTS)")

print(f"🎉 Quest Complete! Total Score: {score}")
`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    monacoLang: 'typescript',
    icon: '🔷',
    code: `// 🔷 Simple TypeScript Game Interface
interface Player {
  name: string;
  level: number;
  hp: number;
}

const player: Player = { name: "Valkyrie", level: 5, hp: 100 };
console.log(\`🛡️ Player: \${player.name} (LVL \${player.level}) - HP: \${player.hp}\`);
`
  },
  {
    id: 'cpp',
    name: 'C++',
    monacoLang: 'cpp',
    icon: '⚡',
    code: `// 🚀 Simple C++ Game Loop
#include <iostream>

int main() {
    std::cout << "⚔️ Welcome to Warlock C++ Arena!" << std::endl;
    int score = 500;
    std::cout << "🏆 High Score: " << score << " PTS" << std::endl;
    return 0;
}
`
  },
  {
    id: 'rust',
    name: 'Rust',
    monacoLang: 'rust',
    icon: '🦀',
    code: `// 🦀 Simple Rust Game Entity
fn main() {
    let hero = "Rust Warrior";
    let hp = 100;
    println!("🚀 {} spawned into cyberspace with {} HP!", hero, hp);
}
`
  },
  {
    id: 'go',
    name: 'Go',
    monacoLang: 'go',
    icon: '🐹',
    code: `// 🐹 Simple Go Game Server
package main
import "fmt"

func main() {
    player := "CyberGhost"
    fmt.Printf("🎮 Player %s connected to the game server!\n", player)
}
`
  },
  {
    id: 'java',
    name: 'Java',
    monacoLang: 'java',
    icon: '☕',
    code: `// ☕ Simple Java Game Program
public class Main {
    public static void main(String[] args) {
        String hero = "Cyber Mage";
        int mana = 100;
        System.out.println("✨ " + hero + " is ready with " + mana + " mana!");
    }
}
`
  },
  {
    id: 'csharp',
    name: 'C#',
    monacoLang: 'csharp',
    icon: '🎯',
    code: `// 🎯 Simple C# Unity Controller
using System;

class Program {
    static void Main() {
        string hero = "Vanguard Mech";
        Console.WriteLine($"⚔️ {hero} systems online and ready for battle!");
    }
}
`
  },
  {
    id: 'html',
    name: 'HTML',
    monacoLang: 'html',
    icon: '🌐',
    code: `<!-- 🌐 Simple Cyberpunk HUD HTML -->
<div class="hud-box">
  <h1>⚔️ WARLOCK CYBER IDE</h1>
  <p>Status: <span style="color: #00ffcc;">ONLINE</span></p>
</div>
`
  },
  {
    id: 'css',
    name: 'CSS',
    monacoLang: 'css',
    icon: '🎨',
    code: `/* 🎨 Simple Cyber Neon Button */
.cyber-button {
  background: #00ffcc;
  color: #0a0a14;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 0 15px #00ffcc;
}
`
  },
  {
    id: 'sql',
    name: 'SQL',
    monacoLang: 'sql',
    icon: '🗄️',
    code: `-- 🗄️ Fetch Top 5 Game Leaderboard Scores
SELECT player_name, score, rank
FROM leaderboards
ORDER BY score DESC
LIMIT 5;
`
  }
];

export const getLanguage = (id) => LANGUAGES.find((l) => l.id === id) || LANGUAGES[0];
