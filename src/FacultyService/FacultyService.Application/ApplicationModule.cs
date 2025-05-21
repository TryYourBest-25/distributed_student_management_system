using Autofac;
using MediatR;

namespace FacultyService.Application;

public class ApplicationModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        // Register application services here
        // For example:
        // builder.RegisterType<MyApplicationService>().As<IMyApplicationService>();
        
        // Register MediatR handlers
        builder.RegisterAssemblyTypes(typeof(ApplicationModule).Assembly)
            .AsClosedTypesOf(typeof(IRequestHandler<,>))
            .AsImplementedInterfaces();
        
        builder.RegisterAssemblyTypes(typeof(ApplicationModule).Assembly)
            .AsClosedTypesOf(typeof(INotificationHandler<>))
            .AsImplementedInterfaces();
        
        builder.RegisterAssemblyTypes(typeof(ApplicationModule).Assembly)
            .AsClosedTypesOf(typeof(IPipelineBehavior<,>))
            .AsImplementedInterfaces();
        
    }
}