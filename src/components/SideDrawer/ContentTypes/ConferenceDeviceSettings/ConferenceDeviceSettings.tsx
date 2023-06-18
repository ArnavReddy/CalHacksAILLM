import {
  Space,
  useTheme
} from '@dolbyio/comms-uikit-react';
import { DrawerHeader } from '@src/components/SideDrawer';
import { useIntl } from 'react-intl';

import LiveAssistant from '@src/components/LiveAssistant/LiveAssistant';
import styles from './ConferenceDeviceSettings.module.scss';

const darkProps = {
  labelColor: 'grey.100',
  textColor: 'grey.100',
  iconColor: 'grey.100',
  backgroundColor: 'grey.800',
  primaryBorderColor: 'grey.500',
  secondaryBorderColor: 'grey.600',
  hoverColor: 'grey.700',
};

const Settings = () => {

  const intl = useIntl();
  const { isDesktop, isMobile, isMobileSmall } = useTheme();

  const isSmartphone = isMobile || isMobileSmall;

  return (
    <Space fw fh className={styles.contentContainer} testID="ConferenceDeviceSettings">
      <DrawerHeader
        title={intl.formatMessage({ id: 'settings' })}
        color="grey.100"
        borderColor="transparent"
        height={isSmartphone ? 48 : 110}
        closeButtonBackgroundColor="grey.500"
        closeButtonOutsideColor="grey.800"
        closeButtonIconColor="white"
        closeButtonStrokeColor="transparent"
        mobileCloseButtonColor="white"
      />
      <LiveAssistant />

    </Space>
  );
};

export default Settings;
