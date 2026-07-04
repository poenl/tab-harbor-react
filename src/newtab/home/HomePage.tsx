import { useTranslation } from '@/i18n'
import { useOpenTabsStore } from '@/stores/openTabs'
import { useTheme } from '@/stores/theme'
import { Moon, Archive, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { SectionHeader } from './SectionHeader.tsx'
import { TabGroupList } from './TabGroupList.tsx'
import { Greeting } from './Greeting.tsx'
import { Hitokoto } from './Hitokoto.tsx'
import { SearchBar } from './SearchBar.tsx'
import { QuickShortcuts } from './QuickShortcuts.tsx'
import { Footer } from './Footer.tsx'
import { TabOutDupeBanner } from './TabOutDupeBanner.tsx'
import { SelectModeProvider, useSelectMode } from './SelectModeContext.tsx'

function HeaderActions({ sleepControlEnabled }: { sleepControlEnabled: boolean }) {
  const { t } = useTranslation()
  const { saveCurrentWindow } = useSelectMode()

  return (
    <>
      {sleepControlEnabled && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => useOpenTabsStore.getState().sleepAllTabs()}
              aria-label={t('sleepAllTabsButton')}
              className="text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
            >
              <Moon strokeWidth={1.8} className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{t('sleepAllTabsButton')}</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={saveCurrentWindow}
            aria-label={t('saveSessionButton')}
            className="text-muted-foreground border-border hover:bg-secondary hover:text-primary"
          >
            <Archive strokeWidth={1.8} className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{t('saveSessionButton')}</TooltipContent>
      </Tooltip>
      <AlertDialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('closeAllTabsButton')}
                className="text-muted-foreground border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <X strokeWidth={1.8} className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">{t('closeAllTabsButton')}</TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('closeAllTabsConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('closeAllTabsConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => useOpenTabsStore.getState().closeAllTabs()}>
              {t('closeAllTabsConfirmAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function HomePage() {
  const { t } = useTranslation()
  const groups = useOpenTabsStore((s) => s.groups)
  const loading = useOpenTabsStore((s) => s.loading)
  const totalTabs = useOpenTabsStore((s) => s.tabs.length)
  const { preferences } = useTheme()
  const { sleepControlEnabled } = preferences

  return (
    <>
      <TabOutDupeBanner />

      {/* ── 两列布局（左: 1.35fr = 标签列表 / 右: 0.95fr = 问候+搜索+快捷） ── */}
      <div className="grid grid-cols-[1.35fr_0.95fr] items-start gap-8 max-[960px]:grid-cols-1 max-[960px]:gap-5 mb-15">
        {/* ── 左栏：打开标签页 ── */}
        <section className="min-w-0">
          <SelectModeProvider>
            <SectionHeader
              title={t('openTabsSectionTitle')}
              count={totalTabs}
              actions={<HeaderActions sleepControlEnabled={sleepControlEnabled} />}
            />
            <TabGroupList groups={groups} loading={loading} />
          </SelectModeProvider>
        </section>

        {/* ── 右栏：头部（问候 + 一言 + 搜索 + 快捷链接） ── */}
        <header>
          <div className="flex flex-col gap-6">
            <Greeting />
            <Hitokoto />
            <SearchBar />
            <QuickShortcuts />
          </div>
        </header>
      </div>

      <Footer />
    </>
  )
}
