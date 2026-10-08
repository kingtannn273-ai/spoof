-- TannSpoof Studio Bridge
-- Paste into Roblox Studio Command Bar after selecting an R6/R15 rig/model.
-- credit by tannn

local Selection = game:GetService("Selection")
local selected = Selection:Get()
assert(#selected > 0, "TannSpoof: select a rig/model first")

local model = selected[1]
local animationId = "rbxassetid://PUT_ID_HERE"

local humanoid = model:FindFirstChildOfClass("Humanoid")
local animator
if humanoid then
    animator = humanoid:FindFirstChildOfClass("Animator") or Instance.new("Animator", humanoid)
else
    local controller = model:FindFirstChildOfClass("AnimationController") or Instance.new("AnimationController", model)
    animator = controller:FindFirstChildOfClass("Animator") or Instance.new("Animator", controller)
end

for _, track in ipairs(animator:GetPlayingAnimationTracks()) do
    track:Stop(0.1)
end

local animation = Instance.new("Animation")
animation.AnimationId = animationId
local track = animator:LoadAnimation(animation)
track.Looped = true
track:Play(0.15)

print("[TannSpoof] Previewing", animationId)
