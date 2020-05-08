import { Hinter } from "@paperbits/common/tutorials/hinter";
import { Confirmation } from "./workshops/confirmation/ko/confirmation";
import { LightboxBindingHandler } from "./ko/bindingHandlers/bindingHandlers.lightbox";
import { GridBindingHandler } from "./ko/bindingHandlers/bindingHandlers.grid";
import { DraggablesBindingHandler } from "./ko/bindingHandlers/bindingHandlers.draggables";
import { CoreModule } from "./core.module";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { VideoPlayerDesignModule } from "./video-player/videoPlayer.design.module";
import { PictureDesignModule } from "./picture/picture.design.module";
import { YoutubePlayerDesignModule } from "./youtube-player/youtubePlayer.design.module";
import { ButtonEditorModule } from "./button/ko/buttonEditor.module";
import { TestimonialsEditorModule } from "./testimonials/ko/testimonialsEditor.module";
import { ColumnEditorModule } from "./column/ko/columnEditor.module";
import { SectionEditorModule } from "./section/ko/sectionEditor.module";
import { RowEditorModule } from "./row/ko/rowEditor.module";
import { BlockWorkshopModule } from "./workshops/block/ko/block.module";
import { BlogDesignModule } from "./workshops/blog/ko/blog.design.module";
import { PageDesignModule } from "./workshops/page/ko/page.design.module";
import { MediaWorkshopModule } from "./workshops/media/ko/media.module";
import { NavigationWorkshopModule } from "./workshops/navigation/ko/navigation.module";
import { SettingsWorkshopModule } from "./workshops/settings/ko/settings.module";
import { Workshops } from "./workshops/ko/workshops";
import { TextblockEditorModule } from "./textblock/ko/textblockEditor.module";
import { DropbucketModule } from "./workshops/dropbucket/ko/dropbucket.module";
import { ViewportSelector } from "./workshops/viewports/ko/viewport-selector";
import { LocaleSelector, LocaleEditor } from "./workshops/localization/ko";
import { HostBindingHandler, BalloonBindingHandler, ResizableBindingHandler } from "./ko/bindingHandlers";
import { MediaHandlers, HtmlEditorProvider } from "@paperbits/common/editing";
import { View } from "@paperbits/common/ui";
import { HyperlinkSelector } from "./workshops/hyperlinks/ko/hyperlinkSelector";
import { WidgetSelector } from "./workshops/widgets/ko/widgetSelector";
import { UrlSelector } from "./workshops/urls/ko/urlSelector";
import { LayoutDesignModule } from "./layout/ko/layout.design.module";
import { HistoryRouteHandler } from "@paperbits/common/routing";
import { UrlHyperlinkProvider } from "@paperbits/common/urls/urlHyperlinkProvider";
import { MediaHyperlinkProvider } from "@paperbits/common/media";
import { DragManager } from "@paperbits/common/ui/draggables";
import { UnhandledErrorHandler } from "@paperbits/common/errors";
import { PlaceholderViewModel } from "./placeholder/ko/placeholderViewModel";
import { DefaultViewManager, Tooltip } from "./ko/ui";
import { KnockoutValidation } from "./ko/validation/validators";
import { CropperBindingHandler } from "./workshops/cropper/cropper";
import { GridEditor } from "./grid/ko";
import { CardEditorModule } from "./card/ko/cardEditor.module";
import { MediaPermalinkResolver } from "@paperbits/common/media/mediaPermalinkResolver.design";
import { GridEditorModule } from "./grid-layout-section/ko/gridEditor.module";
import { GridCellEditorModule } from "./grid-cell/ko/gridCellEditor.module";
import { Tray } from "./workshops/tray/tray";
import { CollapsiblePanelEditorModule } from "./collapsible-panel/ko";
import { MenuEditorModule } from "./menu/ko";
import { Spinner } from "./ko";
import { DesignerUserService } from "./ko/ui/designerUserService";
import { RoleSelector, RoleInput } from "./workshops/roles/ko";
import "./ko/bindingHandlers/bindingHandlers.command";
import "./ko/bindingHandlers/bindingHandlers.dialog";
import "./ko/bindingHandlers/bindingHandlers.activate";
import { ContentEditorModule } from "./content/ko";
import { ViewStack } from "./ko/ui/viewStack";
import { MediaDisplay } from "./workshops/media/ko/mediaDisplay";
import { Lightbox } from "./workshops/media/ko/lightbox";


export class CoreDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindModule(new CoreModule());
        injector.bindCollection("styleGroups");
        injector.bindCollection("dropHandlers");
        injector.bindCollectionLazily("workshopSections");
        injector.bindCollection("trayCommands");
        injector.bindCollection("hyperlinkProviders");
        injector.bindSingleton("viewManager", DefaultViewManager);
        injector.bindSingleton("tray", Tray);
        injector.bindSingleton("viewStack", ViewStack);
        injector.bind("mediaDisplay", MediaDisplay);
        
        injector.bind("mediaHyperlinkProvider", MediaHyperlinkProvider);
        injector.bind("urlHyperlinkProvider", UrlHyperlinkProvider);
        injector.bind("gridEditor", GridEditor);
        injector.bindToCollection("autostart", KnockoutValidation);
        injector.bindToCollection("autostart", ResizableBindingHandler);
        injector.bindToCollection("autostart", CropperBindingHandler);
        injector.bindToCollection("autostart", BalloonBindingHandler);
        injector.bindToCollection("autostart", UnhandledErrorHandler);
        injector.bind("tooltip", Tooltip);
        injector.bindSingleton("dragManager", DragManager);
        injector.bindSingleton("lightbox", Lightbox);
        injector.bind("placeholderWidget", PlaceholderViewModel);
        injector.bindSingleton("htmlEditorProvider", HtmlEditorProvider);
        injector.bindSingleton("mediaHandler", MediaHandlers);
        injector.bind("workshops", Workshops);
        injector.bind("viewportSelector", ViewportSelector);
        injector.bind("localeSelector", LocaleSelector);
        injector.bind("localeEditor", LocaleEditor);
        injector.bind("hyperlinkSelector", HyperlinkSelector);
        injector.bind("widgetSelector", WidgetSelector);
        injector.bind("urlSelector", UrlSelector);
        injector.bind("confirmation", Confirmation);
        injector.bind("roleSelector", RoleSelector);
        injector.bind("roleInput", RoleInput);
        injector.bind("spinner", Spinner);
        injector.bindSingleton("mediaPermalinkResolver", MediaPermalinkResolver);
        injector.bindModule(new TextblockEditorModule());
        injector.bindModule(new PictureDesignModule());
        injector.bindModule(new ButtonEditorModule());
        injector.bindModule(new VideoPlayerDesignModule());
        injector.bindModule(new YoutubePlayerDesignModule());
        injector.bindModule(new TestimonialsEditorModule());
        injector.bindModule(new MenuEditorModule());
        injector.bindModule(new DropbucketModule());
        injector.bindModule(new PageDesignModule());
        // injector.bindModule(new BlogDesignModule());
        injector.bindModule(new MediaWorkshopModule());
        injector.bindModule(new LayoutDesignModule());
        injector.bindModule(new BlockWorkshopModule());
        injector.bindModule(new NavigationWorkshopModule());
        injector.bindModule(new SettingsWorkshopModule());
        injector.bindModule(new ColumnEditorModule());
        injector.bindModule(new RowEditorModule());
        injector.bindModule(new SectionEditorModule());
        injector.bindModule(new GridEditorModule());
        injector.bindModule(new GridCellEditorModule());
        injector.bindModule(new ContentEditorModule());
        injector.bindModule(new CardEditorModule());
        injector.bindModule(new CollapsiblePanelEditorModule());
        injector.bindToCollection("hyperlinkProviders", UrlHyperlinkProvider);
        injector.bindToCollection("autostart", HostBindingHandler);
        injector.bindToCollection("autostart", DraggablesBindingHandler);
        injector.bindToCollection("autostart", GridBindingHandler);
        injector.bindToCollection("autostart", LightboxBindingHandler);
        injector.bindToCollection("autostart", HistoryRouteHandler);
        injector.bindToCollection("autostart", Hinter);
        injector.bindInstance("reservedPermalinks", ["/", "/404", "/500"]);
        injector.resolve("workshopSections");

        const userService = new DesignerUserService();
        injector.bindInstance("userService", userService);
        injector.bindInstance("designerUserService", userService);
    }
}