import { EventSubscription } from 'react-native';

import {
  IAudioFrameObserver,
  IVideoFrameObserver,
  IVideoEncodedFrameObserver,
} from '../AgoraMediaBase';

export type IMediaEngineEvent = IAudioFrameObserver &
  IVideoFrameObserver &
  IVideoEncodedFrameObserver;

declare module '../IAgoraMediaEngine' {
  interface IMediaEngine {
    /**
     * Adds one IMediaEngineEvent listener.
     * After calling this method, you can listen for the corresponding events in the IMediaEngine object and obtain data through IMediaEngineEvent. Depending on your project needs, you can add multiple listeners for the same event.
     *
     * @param eventType The name of the target event to listen for. See IMediaEngineEvent.
     *
     * @param listener The callback function for eventType. Take adding a listener for onPlaybackAudioFrameBeforeMixing as an example: // Create an onPlaybackAudioFrameBeforeMixing object
     * const onPlaybackAudioFrameBeforeMixing = (channelId: string, uid: number, audioFrame: AudioFrame) => {};
     * // Add one onPlaybackAudioFrameBeforeMixing listener
     * engine.addListener('onPlaybackAudioFrameBeforeMixing', onPlaybackAudioFrameBeforeMixing);
     *
     * @returns
     * The native interface EventSubscription in React Native API.
     */
    addListener<EventType extends keyof IMediaEngineEvent>(
      eventType: EventType,
      listener: IMediaEngineEvent[EventType]
    ): EventSubscription;

    /**
     * Removes the specified IMediaEngineEvent listener.
     * For listened events, if you no longer need to receive the callback message, you can call this method to remove the corresponding listener.
     *
     * @param eventType The name of the target event to listen for. See IMediaEngineEvent.
     *
     * @param listener The callback function for eventType. Must pass in the same function object in addListener . Take removing the listener for onJoinChannelSuccess as an example: // Create an onPlaybackAudioFrameBeforeMixing object
     * const onPlaybackAudioFrameBeforeMixing = (channelId: string, uid: number, audioFrame: AudioFrame) => {};
     * // Add one onPlaybackAudioFrameBeforeMixing listener
     * engine.addListener('onPlaybackAudioFrameBeforeMixing', onPlaybackAudioFrameBeforeMixing);
     * // Remove the onPlaybackAudioFrameBeforeMixing listener
     * engine.removeListener('onPlaybackAudioFrameBeforeMixing', onPlaybackAudioFrameBeforeMixing);
     */
    removeListener<EventType extends keyof IMediaEngineEvent>(
      eventType: EventType,
      listener: IMediaEngineEvent[EventType]
    ): void;

    /**
     * Removes all listeners for the specified event.
     *
     * @param eventType The name of the target event to listen for. See IMediaEngineEvent.
     */
    removeAllListeners<EventType extends keyof IMediaEngineEvent>(
      eventType?: EventType
    ): void;
  }
}
