import React from 'react';
import { PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  ErrorCodeType,
  IRtcEngineEventHandler,
  RtcConnection,
} from 'react-native-agora';
import RNFS from 'react-native-fs';

import Config from '../../../config/agora.config';

import {
  BaseComponent,
  BaseVideoComponentState,
} from '../../../components/BaseComponent';
import {
  AgoraButton,
  AgoraDivider,
  AgoraDropdown,
  AgoraImage,
} from '../../../components/ui';
import { arrayToItems } from '../../../utils';

interface State extends BaseVideoComponentState {
  targetUid: number;
  filePath: string;
  takeSnapshot: boolean;
}

export default class TakeSnapshot
  extends BaseComponent<{}, State>
  implements IRtcEngineEventHandler
{
  protected createState(): State {
    return {
      appId: Config.appId,
      enableVideo: true,
      channelId: Config.channelId,
      token: Config.token,
      uid: Config.uid,
      joinChannelSuccess: false,
      remoteUsers: [],
      startPreview: false,
      targetUid: 0,
      filePath: `${
        Platform.OS === 'android'
          ? RNFS.ExternalCachesDirectoryPath
          : RNFS.DocumentDirectoryPath
      }`,
      takeSnapshot: false,
    };
  }

  /**
   * Step 1: initRtcEngine
   */
  protected async initRtcEngine() {
    const { appId } = this.state;
    if (!appId) {
      this.error(`appId is invalid`);
    }

    this.engine = createAgoraRtcEngine();
    this.engine.initialize({
      appId,
      // Should use ChannelProfileLiveBroadcasting on most of cases
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });
    this.engine.registerEventHandler(this);

    if (Platform.OS === 'android') {
      // Need granted the microphone and camera permission
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }

    // Need to enable video on this case
    // If you only call `enableAudio`, only relay the audio stream to the target channel
    this.engine.enableVideo();
  }

  /**
   * Step 2: joinChannel
   */
  protected joinChannel() {
    const { channelId, token, uid } = this.state;
    if (!channelId) {
      this.error('channelId is invalid');
      return;
    }
    if (uid < 0) {
      this.error('uid is invalid');
      return;
    }

    // start joining channel
    // 1. Users can only see each other after they join the
    // same channel successfully using the same app id.
    // 2. If app certificate is turned on at dashboard, token is needed
    // when joining channel. The channel name and uid used to calculate
    // the token has to match the ones used for channel join
    this.engine?.joinChannel(token, channelId, uid, {
      // Make myself as the broadcaster to send stream to remote
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });
  }

  /**
   * Step 3: takeSnapshot
   */
  takeSnapshot = () => {
    const { targetUid, filePath } = this.state;
    if (!filePath) {
      this.error('filePath is invalid');
      return;
    }

    this.engine?.takeSnapshot(targetUid, `${filePath}/${targetUid}.jpg`);
  };

  /**
   * Step 4: leaveChannel
   */
  protected leaveChannel() {
    this.engine?.leaveChannel();
  }

  /**
   * Step 5: releaseRtcEngine
   */
  protected releaseRtcEngine() {
    this.engine?.unregisterEventHandler(this);
    this.engine?.release();
  }

  onSnapshotTaken(
    connection: RtcConnection,
    uid: number,
    filePath: string,
    width: number,
    height: number,
    errCode: number
  ) {
    this.info(
      'onSnapshotTaken',
      'connection',
      connection,
      'uid',
      uid,
      'filePath',
      filePath,
      'width',
      width,
      'height',
      height,
      'errCode',
      errCode
    );
    const { targetUid, filePath: path } = this.state;
    if (filePath === `${path}/${targetUid}.jpg`) {
      this.setState({ takeSnapshot: errCode === ErrorCodeType.ErrOk });
    }
  }

  protected renderConfiguration(): React.ReactNode {
    const { remoteUsers, targetUid, filePath, takeSnapshot } = this.state;
    return (
      <>
        <AgoraDropdown
          title={'targetUid'}
          items={arrayToItems([0, ...remoteUsers])}
          value={targetUid}
          onValueChange={(value) => {
            this.setState({ targetUid: value });
          }}
        />
        {takeSnapshot ? (
          <>
            <AgoraDivider />
            <AgoraImage
              style={styles.image}
              source={{
                uri: `${
                  Platform.OS === 'android' ? 'file://' : ''
                }${filePath}/${targetUid}.jpg`,
              }}
            />
          </>
        ) : undefined}
        <AgoraDivider />
      </>
    );
  }

  protected renderAction(): React.ReactNode {
    const { joinChannelSuccess } = this.state;
    return (
      <>
        <AgoraButton
          disabled={!joinChannelSuccess}
          title={`take Snapshot`}
          onPress={this.takeSnapshot}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    width: 120,
    height: 120,
  },
});
