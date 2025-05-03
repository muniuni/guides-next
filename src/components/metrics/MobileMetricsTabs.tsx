'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import MonthlyChart from './MonthlyChart';
import ImageScoreChart from './ImageScoreChart';
import QuestionScorePanel from './QuestionScorePanel';
import { Monthly } from '@/types/metrics';

interface MobileMetricsTabsProps {
  monthlyData: Monthly[];
  perImageData: any[];
  imageQuestionData: any[] | null;
}

export default function MobileMetricsTabs({
  monthlyData,
  perImageData,
  imageQuestionData,
}: MobileMetricsTabsProps) {
  const [activeTab, setActiveTab] = useState('1');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <TabContext value={activeTab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              fontSize: 13,
              textTransform: 'none',
            },
          }}
        >
          <Tab label="Monthly Scores" value="1" />
          <Tab label="By Image" value="2" />
          <Tab label="By Question" value="3" />
        </TabList>
      </Box>

      <TabPanel value="1" sx={{ p: 0, pt: 1.5 }}>
        <MonthlyChart data={monthlyData} isMobile={true} />
      </TabPanel>

      <TabPanel value="2" sx={{ p: 0, pt: 1.5 }}>
        <ImageScoreChart data={perImageData} isMobile={true} />
      </TabPanel>

      <TabPanel value="3" sx={{ p: 0, pt: 1.5 }}>
        <QuestionScorePanel data={imageQuestionData} isMobile={true} />
      </TabPanel>
    </TabContext>
  );
}
