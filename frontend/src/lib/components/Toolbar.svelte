<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from "$lib/components/ui/input/index.js";
  import { online, screens } from '../stores';
  import { api } from '../api';

  let name = 'Screen';
  let width = 1920 * 2;
  let height = 1080 * 2;

  function addScreen() {
    api('/screens', { method: 'POST', body: JSON.stringify({ name, width, height }) });
  }
</script>

<div class="navbar bg-base-300 shadow z-10">
  <div class="flex-1 px-2">
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <!-- Title / Brand as a navigation trigger -->
          <NavigationMenu.Trigger class="font-bold">Web Buddy</NavigationMenu.Trigger>
          <NavigationMenu.Content class="p-2">
            <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  </div>

  <div class="flex gap-2 items-center">
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Controls</NavigationMenu.Trigger>
          <NavigationMenu.Content class="p-4 w-auto bg-popover rounded-md border">
            <!-- Offline toggle -->
            <label class="label cursor-pointer gap-2 mb-3 flex items-center">
              <span class="label-text mr-2">Offline Mode</span>
              <input type="checkbox" class="toggle" bind:checked={$online} />
            </label>

            <div class="divider my-2"></div>

            <!-- Inputs and Add Screen -->
            <div class="form-control">
              <div class="input-group flex flex-wrap gap-2 items-center">
                <Input class="max-w-xs" placeholder="Smoothie" bind:value={name} />
                <Input class="max-w-xs" placeholder={width.toString()} type="number" bind:value={width} />
                <Input class="max-w-xs" placeholder={height.toString()} type="number" bind:value={height} />
                <Button variant="outline" onclick={addScreen}>Add Screen</Button>
              </div>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  </div>
</div>
