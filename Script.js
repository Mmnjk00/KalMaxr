const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const categoryButtons = document.querySelectorAll('.category-btn');
const currentTopicText = document.getElementById('current-topic-text');

let currentCategory = '';

const responses = {
    scripting: {
        power: `Aqui está um sistema de power por clicks completo:
\`\`\`lua
-- Services
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Remotes
local PowerRemote = Instance.new("RemoteEvent")
PowerRemote.Name = "UpdatePower"
PowerRemote.Parent = ReplicatedStorage

-- Player Data
local playerData = {}

-- Server Script
game.Players.PlayerAdded:Connect(function(player)
    playerData[player.UserId] = {
        power = 0,
        multiplier = 1
    }
    
    -- Load data here from DataStore
end)

PowerRemote.OnServerEvent:Connect(function(player)
    local data = playerData[player.UserId]
    if data then
        data.power = data.power + (1 * data.multiplier)
        PowerRemote:FireClient(player, data.power)
    end
end)

-- Client Script (LocalScript)
local player = game.Players.LocalPlayer
local powerGui = -- Create your GUI here
local clickButton = powerGui.ClickButton
local powerLabel = powerGui.PowerLabel

local function updatePowerDisplay(power)
    powerLabel.Text = "Power: " .. power
end

clickButton.MouseButton1Click:Connect(function()
    PowerRemote:FireServer()
end)

PowerRemote.OnClientEvent:Connect(updatePowerDisplay)
\`\`\``,
        combat: `Sistema de combate avançado:
\`\`\`lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

-- Configuração
local DAMAGE = 10
local COOLDOWN = 1.5
local RANGE = 10

-- Remotes
local CombatRemote = Instance.new("RemoteEvent")
CombatRemote.Name = "Combat"
CombatRemote.Parent = ReplicatedStorage

-- Sistema de Cooldown
local cooldowns = {}

CombatRemote.OnServerEvent:Connect(function(player, targetPosition)
    if cooldowns[player.UserId] then return end
    
    cooldowns[player.UserId] = true
    
    -- Lógica de ataque
    local character = player.Character
    if not character then return end
    
    local humanoid = character:FindFirstChild("Humanoid")
    local rootPart = character:FindFirstChild("HumanoidRootPart")
    
    if humanoid and rootPart then
        -- Efeitos de ataque
        local attackPart = Instance.new("Part")
        attackPart.Anchored = true
        attackPart.CanCollide = false
        attackPart.Transparency = 0.5
        attackPart.Position = targetPosition
        attackPart.Parent = workspace
        
        -- Detectar hits
        local hitPlayers = {}
        for _, otherPlayer in ipairs(Players:GetPlayers()) do
            if otherPlayer ~= player then
                local otherCharacter = otherPlayer.Character
                if otherCharacter then
                    local otherRoot = otherCharacter:FindFirstChild("HumanoidRootPart")
                    if otherRoot and (otherRoot.Position - targetPosition).Magnitude <= RANGE then
                        local otherHumanoid = otherCharacter:FindFirstChild("Humanoid")
                        if otherHumanoid then
                            otherHumanoid.Health = math.max(0, otherHumanoid.Health - DAMAGE);
                            table.insert(hitPlayers, otherPlayer);
                        end
                    end
                end
            end
        end
        
        -- Notificar clientes
        CombatRemote:FireAllClients(player, targetPosition, hitPlayers);
        
        -- Limpar
        game:GetService("Debris"):AddItem(attackPart, 0.5);
    end
    
    -- Reset cooldown
    wait(COOLDOWN);
    cooldowns[player.UserId] = nil;
end)
\`\`\``,
    },
    ui: {
        basic: `Interface básica com Roact:
\`\`\`lua
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Roact = require(ReplicatedStorage.Roact)

local function Button(props)
    return Roact.createElement("TextButton", {
        Text = props.text,
        Size = UDim2.new(0, 200, 0, 50),
        Position = props.position,
        BackgroundColor3 = Color3.fromRGB(0, 200, 200),
        [Roact.Event.MouseButton1Click] = props.onClick
    })
end

local App = Roact.Component:extend("App")

function App:init()
    self:setState({
        count = 0
    })
end

function App:render()
    return Roact.createElement("ScreenGui", {}, {
        Counter = Roact.createElement("TextLabel", {
            Text = "Count: " .. self.state.count,
            Size = UDim2.new(0, 200, 0, 50),
            Position = UDim2.new(0.5, -100, 0.3, -25)
        }),
        Button = Roact.createElement(Button, {
            text = "Increment",
            position = UDim2.new(0.5, -100, 0.4, -25),
            onClick = function()
                self:setState({
                    count = self.state.count + 1
                })
            end
        })
    })
end

local handle = Roact.mount(Roact.createElement(App), game.Players.LocalPlayer.PlayerGui)
\`\`\``,
    },
    game: {
        saving: `Sistema de salvamento com DataStore:
\`\`\`lua
local DataStoreService = game:GetService("DataStoreService")
local playerData = DataStoreService:GetDataStore("PlayerData")

local function saveData(player)
    local success, err = pcall(function()
        local data = {
            power = player.Power.Value,
            coins = player.Coins.Value,
            inventory = player.Inventory:GetChildren()
        }
        playerData:SetAsync(player.UserId, data)
    end)
    
    if not success then
        warn("Erro ao salvar dados:", err)
    end
end

game.Players.PlayerAdded:Connect(function(player)
    local success, data = pcall(function()
        return playerData:GetAsync(player.UserId)
    end)
    
    if success and data then
        -- Carregar dados
        player.Power.Value = data.power
        player.Coins.Value = data.coins
        -- Carregar inventário
    else
        -- Dados padrão para novos jogadores
        player.Power.Value = 0
        player.Coins.Value = 100
    end
end)

game.Players.PlayerRemoving:Connect(saveData)
\`\`\``,
    },
    optimization: {
        tips: `Dicas de otimização:
1. Use FastSignal em vez de BindableEvent
2. Implemente culling para objetos distantes
3. Reduza chamadas de rede
4. Use CFrame para movimentação
5. Agrupe objetos similares
6. Cache resultados frequentes
7. Evite loops aninhados
8. Use Region3 para detecção eficiente`
    }
};

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentCategory = button.dataset.category;
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentTopicText.textContent = button.textContent;
    });
});

function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage('User', message);
    
    setTimeout(() => {
        let response = 'Selecione uma categoria e faça uma pergunta específica sobre desenvolvimento Roblox.';
        
        if (currentCategory) {
            const categoryResponses = responses[currentCategory];
            for (const [key, value] of Object.entries(categoryResponses)) {
                if (message.toLowerCase().includes(key)) {
                    response = value;
                    break;
                }
            }
        }
        
        addMessage('AI', response);
    }, 500);

    userInput.value = '';
}

function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender.toLowerCase()}-message`;
    
    const formattedText = text.replace(/```(\w+)?\n([\s\S]*?)```/g, 
        (_, lang, code) => `<pre><code class="${lang || ''}">${code}</code></pre>`);
    
    messageDiv.innerHTML = `
        <strong>${sender}:</strong>
        <div class="message-content">${formattedText}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    messageDiv.querySelectorAll('pre code').forEach(block => {
        hljs.highlightBlock(block);
    });
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
