<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";

let websocket = null;

const system = ref(null);
const connected = ref(false);

onMounted(() => {
    websocket = new WebSocket("ws://localhost:8080");

    websocket.onopen = () => {
        connected.value = true;

        websocket.send(
            JSON.stringify({
                op: 100,
                data: null,
            }),
        );
    };

    websocket.onerror = () => {
        connected.value = false;
        console.log("Websocket Connect Error");
    };

    websocket.onclose = () => {
        connected.value = false;
    };

    websocket.onmessage = (event) => {
        try {
            system.value = JSON.parse(event.data);
        } catch (error) {
            console.error("Invalid WebSocket data:", error);
        }
    };
});

onUnmounted(() => {
    if (websocket) {
        websocket.close();
        websocket = null;
    }
});

const CPUBrandInformation = computed(() => {
    const name = system.value?.data?.cpuManufacturer?.toLowerCase();

    if (name?.startsWith("amd")) {
        return "/brand/cpu/amd.webp";
    }

    if (name?.startsWith("intel")) {
        return "/brand/cpu/intel.webp";
    }

    return "/brand/null.png";
});

const GPUBrandInformation = computed(() => {
    return (system.value?.data?.gpu ?? []).map((gpu) => {
        const vendor = gpu.vendor?.toLowerCase() ?? "";

        if (vendor.includes("nvidia")) {
            return "/brand/gpu/nvidia.webp";
        }

        if (vendor.includes("amd")) {
            return "/brand/gpu/amd.webp";
        }

        return "/brand/null.png";
    });
});
</script>

<template>
    <div class="min-h-dvh bg-neutral-950 text-neutral-100">
        <div class="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6">
            <!-- Header -->
            <header
                class="flex items-center justify-between border-b border-white/5 py-6"
            >
                <div>
                    <h1 class="text-xl font-semibold tracking-tight">
                        System Information
                    </h1>

                    <p class="mt-1 text-sm text-neutral-500">
                        Real-time system monitoring
                    </p>
                </div>

                <div
                    class="flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1.5"
                >
                    <span
                        class="size-1.5 rounded-full"
                        :class="connected ? 'bg-emerald-400' : 'bg-red-400'"
                    ></span>

                    <span class="text-xs text-neutral-400">
                        {{ connected ? "Connected" : "Disconnected" }}
                    </span>
                </div>
            </header>

            <main class="flex-1 py-10">
                <!-- CPU Header -->
                <section
                    class="rounded-2xl border border-white/10 bg-neutral-900/50 p-6"
                >
                    <div class="flex items-center gap-4">
                        <img
                            :src="CPUBrandInformation"
                            :alt="
                                system?.data.cpuManufacturer ||
                                'Waiting for data...'
                            "
                            class="size-16 rounded-xl border border-white/10 object-cover"
                        />

                        <div class="min-w-0">
                            <p
                                class="mb-1 text-xs uppercase tracking-widest text-neutral-600"
                            >
                                Processor
                            </p>

                            <h2
                                class="truncate text-xl font-semibold text-white"
                            >
                                {{
                                    system?.data.cpuName ||
                                    "Waiting for data..."
                                }}
                            </h2>

                            <p class="mt-1 text-sm text-neutral-500">
                                Manufacturer:
                                <span class="text-neutral-300">
                                    {{ system?.data.cpuManufacturer || "—" }}
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                <!-- CPU Overview -->
                <section class="mt-6">
                    <div class="mb-3">
                        <h3 class="text-sm font-medium text-neutral-400">
                            CPU Overview
                        </h3>
                    </div>

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <!-- Usage -->
                        <article
                            class="rounded-2xl border border-white/10 bg-neutral-900/50 p-5"
                        >
                            <div
                                class="flex items-center justify-between text-sm text-neutral-500"
                            >
                                <span>CPU Usage</span>
                                <i class="bi bi-activity"></i>
                            </div>

                            <div class="mt-4 flex items-baseline gap-1">
                                <span class="text-3xl font-semibold">
                                    {{ system?.data.cpuUsage ?? "—" }}
                                </span>

                                <span class="text-sm text-neutral-600">
                                    %
                                </span>
                            </div>

                            <div
                                class="mt-4 h-1 overflow-hidden rounded-full bg-white/5"
                            >
                                <div
                                    class="h-full rounded-full bg-white transition-all duration-300"
                                    :style="{
                                        width: `${Math.min(
                                            Number(system?.data.cpuUsage ?? 0),
                                            100,
                                        )}%`,
                                    }"
                                ></div>
                            </div>
                        </article>

                        <!-- Speed -->
                        <article
                            class="rounded-2xl border border-white/10 bg-neutral-900/50 p-5"
                        >
                            <div
                                class="flex items-center justify-between text-sm text-neutral-500"
                            >
                                <span>Average Speed</span>
                                <i class="bi bi-speedometer2"></i>
                            </div>

                            <div class="mt-4 flex items-baseline gap-1">
                                <span class="text-3xl font-semibold">
                                    {{ system?.data.cpuSpeedAvg ?? "—" }}
                                </span>

                                <span class="text-sm text-neutral-600">
                                    GHz
                                </span>
                            </div>
                        </article>

                        <!-- Temperature -->
                        <article
                            class="rounded-2xl border border-white/10 bg-neutral-900/50 p-5"
                        >
                            <div
                                class="flex items-center justify-between text-sm text-neutral-500"
                            >
                                <span>Temperature</span>
                                <i class="bi bi-thermometer-half"></i>
                            </div>

                            <div class="mt-4 flex items-baseline gap-1">
                                <span class="text-3xl font-semibold">
                                    {{ system?.data.cpuTempMain ?? "—" }}
                                </span>

                                <span class="text-sm text-neutral-600">
                                    °C
                                </span>
                            </div>
                        </article>
                    </div>
                </section>

                <!-- CPU Cores -->
                <section class="mt-8">
                    <div class="mb-3">
                        <h3 class="text-sm font-medium text-neutral-400">
                            CPU Cores
                        </h3>

                        <p class="mt-1 text-xs text-neutral-600">
                            Individual core speed and usage
                        </p>
                    </div>

                    <div
                        class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <article
                            v-for="(speed, index) in system?.data
                                .cpuSpeedCores || []"
                            :key="index"
                            class="rounded-2xl border border-white/10 bg-neutral-900/50 p-4"
                        >
                            <div class="mb-3 flex items-center justify-between">
                                <span
                                    class="text-xs font-medium text-neutral-500"
                                >
                                    CORE {{ index + 1 }}
                                </span>

                                <span class="text-xs text-neutral-600">
                                    {{ speed }} GHz
                                </span>
                            </div>

                            <div class="flex items-end justify-between">
                                <div>
                                    <span
                                        class="text-2xl font-semibold text-white"
                                    >
                                        {{
                                            system?.data.cpuCoresUsage?.[
                                                index
                                            ] ?? "—"
                                        }}
                                    </span>

                                    <span class="ml-1 text-xs text-neutral-600">
                                        %
                                    </span>
                                </div>

                                <span class="text-xs text-neutral-600">
                                    {{ speed }} GHz
                                </span>
                            </div>

                            <div
                                class="mt-3 h-1 overflow-hidden rounded-full bg-white/5"
                            >
                                <div
                                    class="h-full rounded-full bg-neutral-400 transition-all duration-300"
                                    :style="{
                                        width: `${Math.min(
                                            Number(
                                                system?.data.cpuCoresUsage?.[
                                                    index
                                                ] ?? 0,
                                            ),
                                            100,
                                        )}%`,
                                    }"
                                ></div>
                            </div>
                        </article>
                    </div>
                </section>

                <!-- GPU -->
                <section class="mt-8">
                    <div class="mb-3">
                        <h3 class="text-sm font-medium text-neutral-400">
                            Graphics
                        </h3>

                        <p class="mt-1 text-xs text-neutral-600">
                            Graphics processing unit information
                        </p>
                    </div>

                    <div
                        v-if="system?.data?.gpu?.length"
                        class="grid grid-cols-1 gap-3 lg:grid-cols-2"
                    >
                        <article
                            v-for="(gpu, index) in system.data.gpu"
                            :key="index"
                            class="rounded-2xl border border-white/10 bg-neutral-900/50 p-6"
                        >
                            <!-- GPU Header -->
                            <div class="flex items-center gap-4">
                                <img
                                    :src="GPUBrandInformation[index]"
                                    :alt="gpu.model"
                                    class="size-16 rounded-xl border border-white/10 object-cover"
                                />

                                <div class="min-w-0">
                                    <p
                                        class="mb-1 text-xs uppercase tracking-widest text-neutral-600"
                                    >
                                        GPU {{ index + 1 }}
                                    </p>

                                    <h4
                                        class="truncate text-lg font-semibold text-white"
                                        :title="gpu.model"
                                    >
                                        {{ gpu.model || "Unknown GPU" }}
                                    </h4>

                                    <p class="mt-1 text-sm text-neutral-500">
                                        {{ gpu.vendor || "Unknown Vendor" }}
                                    </p>
                                </div>
                            </div>

                            <!-- GPU Stats -->
                            <div class="mt-6 grid grid-cols-2 gap-3">
                                <!-- GPU Usage -->
                                <div
                                    class="rounded-xl border border-white/5 bg-white/2 p-4"
                                >
                                    <div
                                        class="flex items-center justify-between text-xs text-neutral-600"
                                    >
                                        <span>GPU Usage</span>
                                        <i class="bi bi-activity"></i>
                                    </div>

                                    <div class="mt-3">
                                        <span
                                            class="text-2xl font-semibold text-white"
                                        >
                                            {{ gpu.utilizationGpu ?? "—" }}
                                        </span>

                                        <span
                                            class="ml-1 text-xs text-neutral-600"
                                        >
                                            %
                                        </span>
                                    </div>

                                    <div
                                        v-if="gpu.utilizationGpu != null"
                                        class="mt-3 h-1 overflow-hidden rounded-full bg-white/5"
                                    >
                                        <div
                                            class="h-full rounded-full bg-white transition-all duration-300"
                                            :style="{
                                                width: `${Math.min(
                                                    Number(gpu.utilizationGpu),
                                                    100,
                                                )}%`,
                                            }"
                                        ></div>
                                    </div>
                                </div>

                                <!-- Temperature -->
                                <div
                                    class="rounded-xl border border-white/5 bg-white/2 p-4"
                                >
                                    <div
                                        class="flex items-center justify-between text-xs text-neutral-600"
                                    >
                                        <span>Temperature</span>
                                        <i class="bi bi-thermometer-half"></i>
                                    </div>

                                    <div class="mt-3">
                                        <span
                                            class="text-2xl font-semibold text-white"
                                        >
                                            {{ gpu.temperatureGpu ?? "—" }}
                                        </span>

                                        <span
                                            class="ml-1 text-xs text-neutral-600"
                                        >
                                            °C
                                        </span>
                                    </div>
                                </div>

                                <!-- VRAM -->
                                <div
                                    class="rounded-xl border border-white/5 bg-white/2 p-4"
                                >
                                    <div
                                        class="flex items-center justify-between text-xs text-neutral-600"
                                    >
                                        <span>VRAM</span>
                                        <i class="bi bi-memory"></i>
                                    </div>

                                    <div class="mt-3">
                                        <span
                                            class="text-2xl font-semibold text-white"
                                        >
                                            {{ gpu.vram ?? "—" }}
                                        </span>

                                        <span
                                            class="ml-1 text-xs text-neutral-600"
                                        >
                                            MB
                                        </span>
                                    </div>
                                </div>

                                <!-- Memory Usage -->
                                <div
                                    class="rounded-xl border border-white/5 bg-white/2 p-4"
                                >
                                    <div
                                        class="flex items-center justify-between text-xs text-neutral-600"
                                    >
                                        <span>Memory Usage</span>
                                        <i class="bi bi-memory"></i>
                                    </div>

                                    <div class="mt-3">
                                        <span
                                            class="text-2xl font-semibold text-white"
                                        >
                                            {{ gpu.utilizationMemory ?? "—" }}
                                        </span>

                                        <span
                                            class="ml-1 text-xs text-neutral-600"
                                        >
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Clock -->
                            <div class="mt-3 grid grid-cols-2 gap-3">
                                <div
                                    class="rounded-xl border border-white/5 bg-white/2 p-4"
                                >
                                    <p class="text-xs text-neutral-600">
                                        Core Clock
                                    </p>

                                    <p
                                        class="mt-2 text-sm font-medium text-neutral-300"
                                    >
                                        {{ gpu.clockCore ?? "—" }}
                                        <span class="text-xs text-neutral-600">
                                            MHz
                                        </span>
                                    </p>
                                </div>

                                <div
                                    class="rounded-xl border border-white/5 bg-white/2 p-4"
                                >
                                    <p class="text-xs text-neutral-600">
                                        Memory Clock
                                    </p>

                                    <p
                                        class="mt-2 text-sm font-medium text-neutral-300"
                                    >
                                        {{ gpu.clockMemory ?? "—" }}
                                        <span class="text-xs text-neutral-600">
                                            MHz
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div>

                    <!-- ไม่มี GPU -->
                    <div
                        v-else
                        class="rounded-2xl border border-white/10 bg-neutral-900/50 p-6"
                    >
                        <div
                            class="flex items-center gap-3 text-sm text-neutral-600"
                        >
                            <i class="bi bi-gpu-card"></i>
                            <span>No GPU information available</span>
                        </div>
                    </div>
                </section>

                <!-- RAM -->
                <section class="mt-8">
                    <div class="mb-3">
                        <h3 class="text-sm font-medium text-neutral-400">
                            Memory
                        </h3>
                    </div>

                    <div
                        class="rounded-2xl border border-white/10 bg-neutral-900/50 p-6"
                    >
                        <div
                            class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
                        >
                            <div>
                                <p class="text-xs text-neutral-600">
                                    RAM Usage
                                </p>

                                <div class="mt-2 flex items-baseline gap-2">
                                    <span class="text-4xl font-semibold">
                                        {{ system?.data.ramUsage ?? "—" }}
                                    </span>

                                    <span class="text-sm text-neutral-600">
                                        GB
                                    </span>

                                    <span class="text-sm text-neutral-700">
                                        /
                                        {{ system?.data.ramTotal ?? "—" }}
                                        GB
                                    </span>
                                </div>
                            </div>

                            <div class="w-full md:w-80">
                                <div class="mb-2 flex justify-between text-xs">
                                    <span class="text-neutral-600">
                                        Memory Used
                                    </span>

                                    <span class="text-neutral-400">
                                        {{
                                            system?.data.ramUsagePercent ?? "—"
                                        }}%
                                    </span>
                                </div>

                                <div
                                    class="h-2 overflow-hidden rounded-full bg-white/5"
                                >
                                    <div
                                        class="h-full rounded-full bg-white transition-all duration-300"
                                        :style="{
                                            width: `${Math.min(
                                                Number(
                                                    system?.data
                                                        .ramUsagePercent ?? 0,
                                                ),
                                                100,
                                            )}%`,
                                        }"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <!-- Footer -->
            <footer
                class="border-t border-white/5 py-8 text-center text-xs text-neutral-600"
            >
                <div>
                    {{ new Date().getFullYear() }} &copy;
                    <a
                        href="https://github.com/PluemStudio"
                        class="text-neutral-500 transition hover:text-white"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        PluemStudio (MewChan)
                    </a>
                </div>

                <div class="mt-2 text-neutral-500">
                    Proudly made in Thailand 🇹🇭
                </div>

                <div class="mt-1">
                    Created with Vite (Vue) and WebSocket API
                </div>

                <div class="mt-1 text-neutral-700">Licensed under MIT</div>
            </footer>
        </div>
    </div>
</template>
